-- Girl Math Stocks: user accounts, practice money, and saved stuff.
-- Every table is per-user and protected by row-level security (RLS).
-- Money-moving writes (trades, resets) only happen through security-definer
-- functions, so a user can't edit their own cash or holdings directly.

-- ---------- Profiles (one per auth user) ----------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) <= 40),
  starting_cash numeric(14, 2) not null default 10000,
  cash_balance  numeric(14, 2) not null default 10000 check (cash_balance >= 0),
  created_at    timestamptz not null default now()
);

-- ---------- Practice holdings ----------
create table public.holdings (
  user_id    uuid not null references auth.users (id) on delete cascade,
  ticker     text not null check (ticker ~ '^[A-Z.]{1,6}$'),
  shares     numeric(18, 6) not null check (shares > 0),
  avg_cost   numeric(14, 4) not null check (avg_cost >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, ticker)
);

-- ---------- Trade history (the receipts) ----------
create table public.trades (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  ticker        text not null,
  side          text not null check (side in ('buy', 'sell')),
  shares        numeric(18, 6) not null check (shares > 0),
  price         numeric(14, 4) not null check (price > 0),
  total         numeric(14, 2) not null,
  realized_gain numeric(14, 2),
  created_at    timestamptz not null default now()
);
create index trades_user_created_idx on public.trades (user_id, created_at desc);

-- ---------- Saved "Free Money" calculator scenarios ----------
create table public.saved_scenarios (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  label      text not null check (char_length(label) between 1 and 60),
  emoji      text check (char_length(emoji) <= 8),
  amount     numeric(10, 2) not null check (amount >= 0 and amount <= 100000),
  per_year   integer not null check (per_year between 0 and 1000),
  years      integer not null check (years between 1 and 60),
  rate_pct   numeric(4, 1) not null check (rate_pct between 0 and 30),
  created_at timestamptz not null default now()
);
create index saved_scenarios_user_idx on public.saved_scenarios (user_id, created_at desc);

-- ---------- Watchlist (hearted Sisterhood companies) ----------
create table public.watchlist (
  user_id    uuid not null references auth.users (id) on delete cascade,
  ticker     text not null check (ticker ~ '^[A-Z.]{1,6}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, ticker)
);

-- ---------- Translator progress ("got it" terms) ----------
create table public.learned_terms (
  user_id    uuid not null references auth.users (id) on delete cascade,
  term_id    text not null check (char_length(term_id) <= 60),
  created_at timestamptz not null default now(),
  primary key (user_id, term_id)
);

-- ---------- Row-level security ----------
alter table public.profiles        enable row level security;
alter table public.holdings        enable row level security;
alter table public.trades          enable row level security;
alter table public.saved_scenarios enable row level security;
alter table public.watchlist       enable row level security;
alter table public.learned_terms   enable row level security;

-- Read your own rows only.
create policy "own profile: read"   on public.profiles        for select to authenticated using ((select auth.uid()) = id);
create policy "own holdings: read"  on public.holdings        for select to authenticated using ((select auth.uid()) = user_id);
create policy "own trades: read"    on public.trades          for select to authenticated using ((select auth.uid()) = user_id);

-- Profiles: only the display name is user-editable (column grant below).
create policy "own profile: update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

-- Free-form personal lists: full CRUD on your own rows.
create policy "own scenarios: all" on public.saved_scenarios for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own watchlist: all" on public.watchlist for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own learned: all"   on public.learned_terms for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Holdings and trades have no insert/update/delete policies: only the functions below write them.

-- ---------- New user -> profile ----------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 40));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Trades: the only way cash and holdings change ----------
-- Price comes from the app server (Spring's quote). Practice money only.
create function public.execute_trade(p_ticker text, p_side text, p_shares numeric, p_price numeric)
returns public.trades
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user   uuid := auth.uid();
  v_ticker text := upper(trim(p_ticker));
  v_total  numeric(14, 2);
  v_cash   numeric(14, 2);
  v_hold   public.holdings;
  v_owned  boolean;
  v_gain   numeric(14, 2);
  v_trade  public.trades;
begin
  if v_user is null then
    raise exception 'Sign in to trade.' using errcode = '28000';
  end if;
  if p_side not in ('buy', 'sell') then
    raise exception 'side must be buy or sell.' using errcode = '22023';
  end if;
  if p_shares is null or p_shares <= 0 or p_shares > 10000 then
    raise exception 'shares must be between 0 and 10,000.' using errcode = '22023';
  end if;
  if p_price is null or p_price <= 0 then
    raise exception 'price must be positive.' using errcode = '22023';
  end if;

  v_total := round(p_shares * p_price, 2);

  -- Lock the profile row so two quick clicks can't double-spend.
  select cash_balance into v_cash from public.profiles where id = v_user for update;
  if not found then
    raise exception 'Profile not found.' using errcode = 'P0002';
  end if;

  select * into v_hold from public.holdings where user_id = v_user and ticker = v_ticker for update;
  v_owned := found;

  if p_side = 'buy' then
    if v_total > v_cash then
      raise exception 'Not enough practice cash: this costs $%, you have $%.', v_total, v_cash using errcode = 'P0001';
    end if;
    update public.profiles set cash_balance = cash_balance - v_total where id = v_user;
    insert into public.holdings (user_id, ticker, shares, avg_cost)
    values (v_user, v_ticker, p_shares, p_price)
    on conflict (user_id, ticker) do update
      set avg_cost   = (holdings.avg_cost * holdings.shares + excluded.avg_cost * excluded.shares)
                       / (holdings.shares + excluded.shares),
          shares     = holdings.shares + excluded.shares,
          updated_at = now();
  else
    if not v_owned then
      raise exception 'You don''t own any % to sell.', v_ticker using errcode = 'P0001';
    end if;
    if p_shares > v_hold.shares + 0.000001 then
      raise exception 'You only own % %.', trim_scale(v_hold.shares), v_ticker using errcode = 'P0001';
    end if;
    v_gain := round((p_price - v_hold.avg_cost) * p_shares, 2);
    update public.profiles set cash_balance = cash_balance + v_total where id = v_user;
    if v_hold.shares - p_shares <= 0.000001 then
      delete from public.holdings where user_id = v_user and ticker = v_ticker;
    else
      update public.holdings set shares = shares - p_shares, updated_at = now()
      where user_id = v_user and ticker = v_ticker;
    end if;
  end if;

  insert into public.trades (user_id, ticker, side, shares, price, total, realized_gain)
  values (v_user, v_ticker, p_side, p_shares, p_price, v_total, v_gain)
  returning * into v_trade;
  return v_trade;
end;
$$;

-- ---------- Fresh start: wipe holdings and trades, restore starting cash ----------
create function public.reset_practice_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Sign in first.' using errcode = '28000';
  end if;
  delete from public.holdings where user_id = v_user;
  delete from public.trades where user_id = v_user;
  update public.profiles set cash_balance = starting_cash where id = v_user;
end;
$$;

-- Only signed-in users may call the money functions; nobody may call the trigger function.
revoke execute on function public.execute_trade(text, text, numeric, numeric) from public, anon;
revoke execute on function public.reset_practice_account() from public, anon;
grant execute on function public.execute_trade(text, text, numeric, numeric) to authenticated;
grant execute on function public.reset_practice_account() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
