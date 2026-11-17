"use client";

import { formatUsd } from "@/lib/finance";
import { usePortfolio } from "./PortfolioContext";

/** Hero teaser for the practice portfolio. Reads shared state so it updates after buys and sells. */
export function PortfolioSummaryCard() {
  const { portfolio } = usePortfolio();
  const n = portfolio.positions.length;
  return (
    <a href="#my-portfolio" className="card col-span-2 p-4 transition-colors hover:bg-white">
      <p className="text-xs text-plum-soft">Your practice portfolio</p>
      <p className="font-display text-3xl font-semibold tabular-nums">{formatUsd(portfolio.totalValue, true)}</p>
      <p className="text-xs text-plum-soft">
        {n} {n === 1 ? "holding" : "holdings"} · see the closet →
      </p>
    </a>
  );
}
