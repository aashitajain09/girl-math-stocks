"use client";

import { formatUsd } from "@/lib/finance";
import { ChangeChip } from "./ChangeChip";
import { usePortfolio } from "./PortfolioContext";

/** Hero teaser for the practice account. Reads shared state so it updates after every trade. */
export function PortfolioSummaryCard() {
  const { portfolio } = usePortfolio();
  const { netWorth, cash, startingCash, positions } = portfolio;
  const sinceStartPct = startingCash ? ((netWorth - startingCash) / startingCash) * 100 : 0;
  const n = positions.length;
  return (
    <a href="#my-portfolio" className="card col-span-2 p-4 transition-colors hover:bg-white">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-plum-soft">Your practice net worth</p>
        <ChangeChip value={sinceStartPct} />
      </div>
      <p className="font-display text-3xl font-semibold tabular-nums">{formatUsd(netWorth, true)}</p>
      <p className="text-xs text-plum-soft">
        {formatUsd(cash, true)} cash · {n} {n === 1 ? "holding" : "holdings"} · see the closet →
      </p>
    </a>
  );
}
