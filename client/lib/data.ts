import "server-only";

// Data layer shared by Server Components (app/page.tsx) and Route Handlers (app/api/*).
// Server Components call these directly instead of fetching our own /api routes.

import { BackendError, callBackend } from "./backends";
import { MOCK_GLOSSARY, MOCK_QUOTES, MOCK_SCENARIOS, MOCK_STOCKS } from "./mock-data";
import type {
  DictionaryResponse,
  GirlMathQuote,
  Holding,
  PortfolioPosition,
  PortfolioResponse,
  Scenario,
  Stock,
  StocksResponse,
} from "./types";

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

// ---------- Portfolio (Spring) ----------

// In-memory fallback used only when Spring is down (resets on server restart).
const mockHoldings: Holding[] = [
  { ticker: "ULTA", shares: 1, avgCost: 480 },
  { ticker: "BMBL", shares: 10, avgCost: 7.2 },
];

function priceHoldings(holdings: Holding[], stocks: Stock[]): PortfolioResponse {
  const positions: PortfolioPosition[] = holdings.flatMap((h) => {
    const s = stocks.find((x) => x.ticker === h.ticker);
    if (!s) return [];
    const value = s.price * h.shares;
    const cost = h.avgCost * h.shares;
    return [{ ...h, name: s.name, price: s.price, value, gain: value - cost, gainPct: cost ? ((value - cost) / cost) * 100 : 0 }];
  });
  return {
    positions,
    totalValue: positions.reduce((a, p) => a + p.value, 0),
    totalGain: positions.reduce((a, p) => a + p.gain, 0),
    source: "mock",
  };
}

export async function getPortfolio(): Promise<PortfolioResponse> {
  const fromSpring = await callBackend<Omit<PortfolioResponse, "source">>("spring", "/api/portfolio");
  if (fromSpring) return { ...fromSpring, source: "spring" };
  return priceHoldings(mockHoldings, MOCK_STOCKS);
}

export async function addHolding(input: { ticker: string; shares: number }): Promise<PortfolioResponse> {
  const fromSpring = await callBackend<Omit<PortfolioResponse, "source">>("spring", "/api/portfolio/holdings", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (fromSpring) return { ...fromSpring, source: "spring" };

  const stock = MOCK_STOCKS.find((s) => s.ticker === input.ticker);
  if (!stock) throw new BackendError(400, `Unknown ticker: ${input.ticker}`);
  {
    const existing = mockHoldings.find((h) => h.ticker === input.ticker);
    if (existing) {
      const totalShares = existing.shares + input.shares;
      existing.avgCost = (existing.avgCost * existing.shares + stock.price * input.shares) / totalShares;
      existing.shares = totalShares;
    } else {
      mockHoldings.push({ ticker: input.ticker, shares: input.shares, avgCost: stock.price });
    }
  }
  return priceHoldings(mockHoldings, MOCK_STOCKS);
}

/** Simulated sale. Omit `shares` to sell the whole position. */
export async function sellHolding(input: { ticker: string; shares?: number }): Promise<PortfolioResponse> {
  const qs = input.shares ? `?shares=${input.shares}` : "";
  const fromSpring = await callBackend<Omit<PortfolioResponse, "source">>(
    "spring",
    `/api/portfolio/holdings/${encodeURIComponent(input.ticker)}${qs}`,
    { method: "DELETE" },
  );
  if (fromSpring) return { ...fromSpring, source: "spring" };

  const i = mockHoldings.findIndex((h) => h.ticker === input.ticker);
  if (i < 0) throw new BackendError(400, `You don't own any ${input.ticker} to sell.`);
  const h = mockHoldings[i];
  if (input.shares && input.shares > h.shares) {
    throw new BackendError(400, `You only own ${h.shares} ${input.ticker}.`);
  }
  const left = input.shares ? h.shares - input.shares : 0;
  if (left <= 1e-9) mockHoldings.splice(i, 1);
  else h.shares = left;
  return priceHoldings(mockHoldings, MOCK_STOCKS);
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
