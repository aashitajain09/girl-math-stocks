import "server-only";

// Data layer shared by Server Components (app/page.tsx) and Route Handlers (app/api/*).
// Server Components call these directly instead of fetching our own /api routes.

import { BackendError, callBackend } from "./backends";
import { MOCK_GLOSSARY, MOCK_QUOTES, MOCK_SCENARIOS, MOCK_STOCKS } from "./mock-data";
import type { DictionaryResponse, GirlMathQuote, Scenario, Stock, StocksResponse } from "./types";

// ---------- Stocks (Spring) ----------

export async function getStocks(): Promise<StocksResponse> {
  const fromSpring = await callBackend<Omit<StocksResponse, "source">>("spring", "/api/stocks");
  if (fromSpring) return { ...fromSpring, source: "spring" };
  return { stocks: MOCK_STOCKS, source: "mock", demo: true, asOf: new Date().toISOString() };
}

export async function getStock(ticker: string): Promise<Stock | null> {
  const t = ticker.toUpperCase();
  let fromSpring: Stock | null;
  try {
    fromSpring = await callBackend<Stock>("spring", `/api/stocks/${encodeURIComponent(t)}`);
  } catch (e) {
    if (e instanceof BackendError && e.status === 404) return null;
    throw e;
  }
  if (fromSpring) return fromSpring;
  return MOCK_STOCKS.find((s) => s.ticker === t) ?? null;
}

// ---------- Girl Math content (Node) ----------

export async function getDictionary(q = "", tag = ""): Promise<DictionaryResponse> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  const qs = params.size ? `?${params}` : "";
  const fromNode = await callBackend<{ entries: DictionaryResponse["entries"] }>("node", `/api/dictionary${qs}`);
  if (fromNode) return { entries: fromNode.entries, source: "node" };

  const needle = q.trim().toLowerCase();
  const wantTag = tag.trim().toLowerCase();
  const entries = MOCK_GLOSSARY.filter(
    (e) =>
      (!needle || [e.term, e.wallStreet, e.girlMath, e.tag].some((f) => f.toLowerCase().includes(needle))) &&
      (!wantTag || e.tag.toLowerCase() === wantTag),
  );
  return { entries, source: "mock" };
}

export async function getQuote(): Promise<GirlMathQuote> {
  const fromNode = await callBackend<GirlMathQuote>("node", "/api/girl-math-quote");
  return fromNode ?? MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)];
}

export async function getScenarios(): Promise<Scenario[]> {
  const fromNode = await callBackend<{ scenarios: Scenario[] }>("node", "/api/scenarios");
  return fromNode?.scenarios ?? MOCK_SCENARIOS;
}
