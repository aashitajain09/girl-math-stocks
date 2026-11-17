// Shared types for the Girl Math Stocks client.
// These mirror the JSON shapes returned by server-node and server-spring.

export type Sector = "Beauty" | "Fashion" | "Tech" | "Dating" | "Auto" | "Services" | "Insurance";

export interface Stock {
  ticker: string;
  name: string;
  sector: Sector;
  /** Why she's on the list: founder or current leader. */
  herStory: string;
  /** A short, playful one-liner for the card. */
  vibe: string;
  price: number;
  changePct: number;
  /** Last ~30 closing prices, oldest first. Used for sparklines. */
  history: number[];
}

export interface StocksResponse {
  stocks: Stock[];
  /** "spring" when served by the Spring Boot service, "mock" when the client fell back. */
  source: "spring" | "mock";
  /** Prices are demo data until a market-data provider is wired up. */
  demo: boolean;
  asOf: string;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  wallStreet: string;
  girlMath: string;
  tag: string;
}

export interface DictionaryResponse {
  entries: GlossaryEntry[];
  source: "node" | "mock";
}

export interface GirlMathQuote {
  quote: string;
  category: string;
}

export interface Scenario {
  id: string;
  label: string;
  emoji: string;
  amount: number;
  /** How many times per year the treat happens. */
  perYear: number;
  quip: string;
}

export interface Holding {
  ticker: string;
  shares: number;
  avgCost: number;
}

export interface PortfolioPosition extends Holding {
  name: string;
  price: number;
  value: number;
  gain: number;
  gainPct: number;
}

export interface Trade {
  id: number;
  ticker: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  /** Profit or loss locked in by a sale; null for buys. */
  realizedGain: number | null;
  createdAt: string;
}

/** The signed-in user's practice account, priced with current (demo) quotes. */
export interface PortfolioResponse {
  positions: PortfolioPosition[];
  /** Market value of all holdings. */
  holdingsValue: number;
  /** Unrealized gain across current holdings. */
  totalGain: number;
  cash: number;
  startingCash: number;
  /** cash + holdingsValue */
  netWorth: number;
  /** Most recent trades, newest first. */
  trades: Trade[];
}

export interface SavedScenario {
  id: string;
  label: string;
  emoji: string | null;
  amount: number;
  perYear: number;
  years: number;
  ratePct: number;
}

/** Everything personal the dashboard needs for the signed-in user. */
export interface UserExtras {
  watchlist: string[];
  learnedTerms: string[];
  savedScenarios: SavedScenario[];
}

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string | null;
}
