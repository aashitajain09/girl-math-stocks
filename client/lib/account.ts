import "server-only";

// The signed-in user's data, stored in Supabase and protected by row-level security.
// Prices come from Spring (lib/data.ts); trades go through the execute_trade() database function.

import { cache } from "react";
import { BackendError } from "./backends";
import { getStock, getStocks } from "./data";
import { createClient } from "./supabase/server";
import type { CurrentUser, PortfolioPosition, PortfolioResponse, SavedScenario, Trade, UserExtras } from "./types";

const num = (v: unknown) => Number(v ?? 0);

/** The verified current user, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const meta = (claims.user_metadata ?? {}) as { display_name?: string };
  return { id: claims.sub, email: String(claims.email ?? ""), displayName: meta.display_name || null };
});

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new BackendError(401, "Sign in to see your portfolio.");
  return user;
}

export async function getPortfolio(): Promise<PortfolioResponse> {
  const user = await requireUser();
  const supabase = await createClient();
  const [profileRes, holdingsRes, tradesRes, stocksRes] = await Promise.all([
    supabase.from("profiles").select("cash_balance, starting_cash").eq("id", user.id).single(),
    supabase.from("holdings").select("ticker, shares, avg_cost").order("updated_at", { ascending: false }),
    supabase
      .from("trades")
      .select("id, ticker, side, shares, price, total, realized_gain, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    getStocks(),
  ]);
  for (const r of [profileRes, holdingsRes, tradesRes]) {
    if (r.error) throw new Error(`Couldn't load your portfolio: ${r.error.message}`);
  }

  const byTicker = new Map(stocksRes.stocks.map((s) => [s.ticker, s]));
  const positions: PortfolioPosition[] = (holdingsRes.data ?? []).map((h) => {
    const shares = num(h.shares);
    const avgCost = num(h.avg_cost);
    const stock = byTicker.get(h.ticker);
    const price = stock?.price ?? avgCost;
    const value = price * shares;
    const cost = avgCost * shares;
    return {
      ticker: h.ticker,
      shares,
      avgCost,
      name: stock?.name ?? h.ticker,
      price,
      value,
      gain: value - cost,
      gainPct: cost ? ((value - cost) / cost) * 100 : 0,
    };
  });

  const trades: Trade[] = (tradesRes.data ?? []).map((t) => ({
    id: t.id,
    ticker: t.ticker,
    side: t.side as Trade["side"],
    shares: num(t.shares),
    price: num(t.price),
    total: num(t.total),
    realizedGain: t.realized_gain === null ? null : num(t.realized_gain),
    createdAt: t.created_at,
  }));

  const holdingsValue = positions.reduce((a, p) => a + p.value, 0);
  const cash = num(profileRes.data?.cash_balance);
  return {
    positions,
    holdingsValue,
    totalGain: positions.reduce((a, p) => a + p.gain, 0),
    cash,
    startingCash: num(profileRes.data?.starting_cash),
    netWorth: cash + holdingsValue,
    trades,
  };
}

/**
 * Buy or sell at the current quote. The price is looked up here on the server,
 * never taken from the browser. Omit `shares` on a sell to sell the whole position.
 */
export async function trade(input: { ticker: string; side: "buy" | "sell"; shares?: number }): Promise<PortfolioResponse> {
  await requireUser();
  const stock = await getStock(input.ticker);
  if (!stock) throw new BackendError(400, `We couldn't find ${input.ticker} in the Sisterhood.`);

  const supabase = await createClient();
  let shares = input.shares;
  if (shares === undefined) {
    const { data } = await supabase.from("holdings").select("shares").eq("ticker", stock.ticker).maybeSingle();
    if (!data) throw new BackendError(400, `You don't own any ${stock.ticker} to sell.`);
    shares = num(data.shares);
  }

  const { error } = await supabase.rpc("execute_trade", {
    p_ticker: stock.ticker,
    p_side: input.side,
    p_shares: shares,
    p_price: stock.price,
  });
  if (error) {
    // P0001 / 22023 are our own friendly messages from the database function.
    if (error.code === "P0001" || error.code === "22023") throw new BackendError(400, error.message);
    if (error.code === "28000") throw new BackendError(401, "Sign in to trade.");
    throw new Error(`Trade failed: ${error.message}`);
  }
  return getPortfolio();
}

/** Wipes holdings and trade history and restores the starting cash. */
export async function resetAccount(): Promise<PortfolioResponse> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_practice_account");
  if (error) throw new Error(`Reset failed: ${error.message}`);
  return getPortfolio();
}

export async function getUserExtras(): Promise<UserExtras> {
  await requireUser();
  const supabase = await createClient();
  const [watch, learned, scenarios] = await Promise.all([
    supabase.from("watchlist").select("ticker"),
    supabase.from("learned_terms").select("term_id"),
    supabase
      .from("saved_scenarios")
      .select("id, label, emoji, amount, per_year, years, rate_pct")
      .order("created_at", { ascending: false }),
  ]);
  return {
    watchlist: (watch.data ?? []).map((r) => r.ticker),
    learnedTerms: (learned.data ?? []).map((r) => r.term_id),
    savedScenarios: (scenarios.data ?? []).map(
      (s): SavedScenario => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji,
        amount: num(s.amount),
        perYear: num(s.per_year),
        years: num(s.years),
        ratePct: num(s.rate_pct),
      }),
    ),
  };
}
