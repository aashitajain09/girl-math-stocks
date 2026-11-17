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

export interface PortfolioResponse {
  positions: PortfolioPosition[];
  totalValue: number;
  totalGain: number;
  source: "spring" | "mock";
}
