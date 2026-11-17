"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { PortfolioResponse } from "@/lib/types";

interface PortfolioCtx {
  portfolio: PortfolioResponse;
  addShares: (ticker: string, shares: number) => Promise<void>;
  /** Omit `shares` to sell the whole position. */
  sellShares: (ticker: string, shares?: number) => Promise<void>;
  pending: string | null;
  error: string | null;
}

const Ctx = createContext<PortfolioCtx | null>(null);

/** Shares portfolio state between the Sisterhood cards ("add") and the My Portfolio panel. */
export function PortfolioProvider({ initial, children }: { initial: PortfolioResponse; children: ReactNode }) {
  const [portfolio, setPortfolio] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (ticker: string, input: RequestInfo, init: RequestInit) => {
    setPending(ticker);
    setError(null);
    try {
      const res = await fetch(input, init);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went sideways.");
      setPortfolio(data as PortfolioResponse);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }, []);

  const addShares = useCallback(
    (ticker: string, shares: number) =>
      run(ticker, "/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, shares }),
      }),
    [run],
  );

  const sellShares = useCallback(
    (ticker: string, shares?: number) => {
      const qs = new URLSearchParams({ ticker });
      if (shares) qs.set("shares", String(shares));
      return run(ticker, `/api/portfolio?${qs}`, { method: "DELETE" });
    },
    [run],
  );

  return <Ctx.Provider value={{ portfolio, addShares, sellShares, pending, error }}>{children}</Ctx.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortfolio must be used inside <PortfolioProvider>");
  return ctx;
}
