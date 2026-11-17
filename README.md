# Girl Math Stocks

Learn the stock market through girl math: track women-founded and women-led companies,
translate Wall Street jargon, and see what your iced coffee could become.

Users sign up with email and password and get **$10,000 in practice cash**. Their portfolio, trade
history, watchlist, saved calculator scenarios, and translator progress are saved to their account.

## Architecture

```
Browser ──► Next.js (client, :3000)
              ├─ proxy.ts              refreshes the Supabase session, sends signed-out visitors to /login
              ├─ app/page.tsx          dashboard (Server Component)
              ├─ app/login, app/signup, app/auth/*   Supabase Auth (email + password)
              └─ app/api/*             backend-for-frontend route handlers
                    ├──► server-node   (:5050)  dictionary, quotes, calculator presets
                    ├──► server-spring (:8080)  stock catalog + prices
                    └──► Supabase      accounts, cash, holdings, trades, watchlist, saved stuff
```

The browser only talks to Next.js and (for the signed-in user's own lists) Supabase directly.
If Node or Spring is down, content and prices fall back to `client/lib/mock-data.ts`.

### Data and security (Supabase)

Schema lives in `supabase/migrations/`. Every table has row-level security, so a user can only
read and write their own rows.

| Table             | What it holds                              | Who writes it                       |
| ----------------- | ------------------------------------------ | ----------------------------------- |
| `profiles`        | display name, starting cash, cash balance  | sign-up trigger; user can rename    |
| `holdings`        | shares + average cost per ticker           | `execute_trade()` only              |
| `trades`          | every buy/sell with price and realized gain | `execute_trade()` only             |
| `watchlist`       | hearted companies                          | the user                            |
| `saved_scenarios` | saved "Free Money" calculator setups       | the user                            |
| `learned_terms`   | translator terms marked "got it"           | the user                            |

Cash and holdings change only through the `execute_trade()` and `reset_practice_account()`
database functions. They lock the account row, check cash and shares, and write the trade
atomically. The Next.js server supplies the price from Spring's quote, never from the browser.

## Run it

```bash
# 1. Node service
cd server-node && npm install && npm run dev        # http://localhost:5050

# 2. Spring service (needs Java 21+)
cd server-spring && ./mvnw spring-boot:run           # http://localhost:8080

# 3. Frontend (fill in the Supabase URL + publishable key in .env.local)
cd client && cp .env.example .env.local && npm run dev   # http://localhost:3000
```

Supabase: new projects require email confirmation. The built-in mailer only sends a few emails
per hour, so for heavy testing either turn off "Confirm email" (Authentication → Sign In / Providers)
or set up custom SMTP. When deploying, add your site URL under Authentication → URL Configuration.

## API

| Next.js route (BFF)        | Proxies to                         | Notes                         |
| -------------------------- | ---------------------------------- | ----------------------------- |
| `GET /api/stocks`          | Spring `GET /api/stocks`           | public; `?sector=` on Spring  |
| `GET /api/stocks/:ticker`  | Spring `GET /api/stocks/{ticker}`  | 404 if unknown                |
| `GET /api/portfolio`      | Supabase (signed-in user)          | cash, holdings priced via Spring, recent trades |
| `POST /api/portfolio`     | Supabase `execute_trade()`         | body `{ ticker, shares, side? }`, priced on the server |
| `DELETE /api/portfolio?ticker=&shares=` | Supabase `execute_trade()` | sell; omit `shares` to sell all |
| `POST /api/portfolio/reset` | Supabase `reset_practice_account()` | clear holdings + trades, restore cash |
| `GET /api/dictionary?q=&tag=` | Node `GET /api/dictionary`      | search and/or filter by topic |
| `GET /api/quote`           | Node `GET /api/girl-math-quote`    | random quote                  |
| `GET /api/scenarios`       | Node `GET /api/scenarios`          | calculator presets            |

Portfolio routes need a signed-in user (401 otherwise). Errors come back as `{ "error": "..." }` with
a 4xx status (bad ticker, not enough cash, overselling). Only an unreachable service or a 5xx from
Node/Spring falls back to mock data.

## Before launch

- Prices are **demo data** (deterministic random walk). Plug in a market-data provider in
  `StockCatalog.java`.
- Company leadership lines are seed copy — re-verify them, since CEOs change.
- `execute_trade()` trusts the price the Next.js server passes. A user calling the RPC directly with
  their own token could fake a price for their *practice* account. If that ever matters (leaderboards),
  store quotes in a table the function reads, or call it with a server-only key.
