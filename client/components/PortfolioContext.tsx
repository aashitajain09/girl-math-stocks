"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { PortfolioResponse } from "@/lib/types";

interface PortfolioCtx {
  portfolio: PortfolioResponse;
  addShares: (ticker: string, shares: number) => Promise<void>;
  pending: string | null;
  error: string | null;
}

const Ctx = createContext<PortfolioCtx | null>(null);

/** Shares portfolio state between the Sisterhood cards ("add") and the My Portfolio panel. */
export function PortfolioProvider({ initial, children }: { initial: PortfolioResponse; children: ReactNode }) {
  const [portfolio, setPortfolio] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addShares = useCallback(async (ticker: string, shares: number) => {
    setPending(ticker);
    setError(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, shares }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went sideways.");
      setPortfolio(data as PortfolioResponse);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }, []);

  return <Ctx.Provider value={{ portfolio, addShares, pending, error }}>{children}</Ctx.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortfolio must be used inside <PortfolioProvider>");
  return ctx;
}
