// Fallback data so the UI works even when server-node / server-spring aren't running.
// The source of truth lives in the backends:
//   - stocks + portfolio  -> server-spring (StockCatalog.java)
//   - dictionary, quotes, scenarios -> server-node (data/*.js)
//
// NOTE: prices are DEMO values generated deterministically, not market data.
// Leadership details are seed copy — verify before launch, since CEOs change.

import type { GirlMathQuote, GlossaryEntry, Scenario, Sector, Stock } from "./types";

interface Seed {
  ticker: string;
  name: string;
  sector: Sector;
  herStory: string;
  vibe: string;
  basePrice: number;
}

export const STOCK_SEEDS: Seed[] = [
  { ticker: "ULTA", name: "Ulta Beauty", sector: "Beauty", herStory: "Led by CEO Kecia Steelman", vibe: "Your Saturday errand, but make it a holding.", basePrice: 520 },
  { ticker: "EL", name: "Estée Lauder", sector: "Beauty", herStory: "Co-founded by Estée Lauder in 1946", vibe: "The OG self-made beauty empire.", basePrice: 78 },
  { ticker: "BMBL", name: "Bumble", sector: "Dating", herStory: "Founded and led by Whitney Wolfe Herd", vibe: "Women make the first move. Including on the cap table.", basePrice: 6 },
  { ticker: "REAL", name: "The RealReal", sector: "Fashion", herStory: "Founded by Julie Wainwright", vibe: "Consignment, but it's a ticker.", basePrice: 9 },
  { ticker: "RENT", name: "Rent the Runway", sector: "Fashion", herStory: "Co-founded by Jennifer Hyman & Jennifer Fleiss", vibe: "Closet in the cloud.", basePrice: 8 },
  { ticker: "SFIX", name: "Stitch Fix", sector: "Fashion", herStory: "Founded by Katrina Lake", vibe: "A stylist in a box, IPO'd by a founder in her 30s.", basePrice: 5 },
  { ticker: "AMD", name: "AMD", sector: "Tech", herStory: "Led by CEO Dr. Lisa Su", vibe: "Chips. The silicon kind.", basePrice: 240 },
  { ticker: "GM", name: "General Motors", sector: "Auto", herStory: "Led by CEO Mary Barra", vibe: "Hot girl drives a hot stock.", basePrice: 70 },
  { ticker: "ACN", name: "Accenture", sector: "Services", herStory: "Led by CEO Julie Sweet", vibe: "The consultant who's always right.", basePrice: 260 },
  { ticker: "PGR", name: "Progressive", sector: "Insurance", herStory: "Led by CEO Tricia Griffith", vibe: "Boring is the new rich.", basePrice: 245 },
];

/** Small deterministic PRNG so demo charts are stable across reloads. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function buildDemoStock(seed: Seed): Stock {
  const rand = seededRandom(seed.ticker);
  const history: number[] = [];
  let p = seed.basePrice;
  for (let i = 0; i < 30; i++) {
    p = p * (1 + (rand() - 0.48) * 0.04);
    history.push(Math.round(p * 100) / 100);
  }
  const price = history[history.length - 1];
  const prev = history[history.length - 2];
  return {
    ticker: seed.ticker,
    name: seed.name,
    sector: seed.sector,
    herStory: seed.herStory,
    vibe: seed.vibe,
    price,
    changePct: Math.round(((price - prev) / prev) * 10000) / 100,
    history,
  };
}

export const MOCK_STOCKS: Stock[] = STOCK_SEEDS.map(buildDemoStock);

export const MOCK_GLOSSARY: GlossaryEntry[] = [
  { id: "correction", term: "Market correction", wallStreet: "A decline of 10% or more from a recent peak.", girlMath: "Your favorite designer stock just went on clearance. You haven't lost a cent unless you sell — that's just a price tag, babe.", tag: "Market moods" },
  { id: "dividend", term: "Dividend", wallStreet: "A share of company profits paid out to shareholders.", girlMath: "The company Venmos you for being a loyal customer. It's basically a cashback reward for holding.", tag: "Getting paid" },
  { id: "dca", term: "Dollar-cost averaging", wallStreet: "Investing a fixed amount on a regular schedule regardless of price.", girlMath: "A subscription box, but for your future self. Same amount every month, no overthinking.", tag: "Strategy" },
  { id: "diversification", term: "Diversification", wallStreet: "Spreading money across different investments to reduce risk.", girlMath: "Don't put your whole personality into one situationship. Spread the love.", tag: "Strategy" },
  { id: "bull", term: "Bull market", wallStreet: "A sustained period of rising prices.", girlMath: "Main character energy. Everything's going up and you're glowing.", tag: "Market moods" },
  { id: "bear", term: "Bear market", wallStreet: "A decline of 20% or more lasting a while.", girlMath: "Cozy season. Prices are low, so you shop the sale and hibernate.", tag: "Market moods" },
  { id: "etf", term: "ETF", wallStreet: "An exchange-traded fund holding a basket of securities.", girlMath: "The sampler set. A little bit of everything in one purchase.", tag: "Products" },
  { id: "compound", term: "Compound interest", wallStreet: "Earning returns on your previous returns.", girlMath: "Your money's glow-up has a glow-up. The skincare routine that keeps paying off.", tag: "Getting paid" },
  { id: "volatility", term: "Volatility", wallStreet: "How much and how quickly a price moves.", girlMath: "That one friend's group-chat energy. Ups, downs, all caps. Strap in.", tag: "Market moods" },
  { id: "portfolio", term: "Portfolio", wallStreet: "The collection of investments you own.", girlMath: "Your capsule wardrobe, but every piece pays rent.", tag: "Basics" },
  { id: "pe", term: "P/E ratio", wallStreet: "Share price divided by earnings per share.", girlMath: "Cost-per-wear for a company. How much are you paying for each dollar it earns?", tag: "Basics" },
  { id: "index", term: "Index fund", wallStreet: "A fund that tracks a market index like the S&P 500.", girlMath: "Buying the whole mall instead of guessing which store will be trendy.", tag: "Products" },
];

export const MOCK_QUOTES: GirlMathQuote[] = [
  { quote: "If I return a $50 top and buy a $50 stock, the stock was completely free.", category: "Portfolio growth" },
  { quote: "It's not a loss if I don't sell. It's a long-term relationship.", category: "Mindset" },
  { quote: "Cost-per-wear, but for shares: hold it 10 years and it basically paid me.", category: "Long game" },
];

export const MOCK_SCENARIOS: Scenario[] = [
  { id: "iced-coffee", label: "Iced oat latte", emoji: "☕", amount: 6.5, perYear: 260, quip: "Every weekday. We don't judge, we calculate." },
  { id: "takeout", label: "Friday takeout", emoji: "🥡", amount: 32, perYear: 52, quip: "Cooking once a week is basically a salary." },
  { id: "sephora", label: "\"Just browsing\" Sephora run", emoji: "💄", amount: 45, perYear: 24, quip: "Twice a month. The cart was a suggestion." },
  { id: "rideshare", label: "Rideshare home", emoji: "🚗", amount: 18, perYear: 100, quip: "Walking is free cardio AND free money." },
];
