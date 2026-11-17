"use client";

import { useMemo, useState } from "react";
import type { Stock } from "@/lib/types";
import { formatUsd } from "@/lib/finance";
import { ChangeChip } from "./ChangeChip";
import { Sparkline } from "./Sparkline";
import { usePortfolio } from "./PortfolioContext";

export function SisterhoodPortfolio({ stocks, demo }: { stocks: Stock[]; demo: boolean }) {
  const sectors = useMemo(() => ["All", ...Array.from(new Set(stocks.map((s) => s.sector)))], [stocks]);
  const [sector, setSector] = useState("All");
  const { addShares, pending, portfolio } = usePortfolio();
  const visible = sector === "All" ? stocks : stocks.filter((s) => s.sector === sector);
  const owned = new Set(portfolio.positions.map((p) => p.ticker));

  return (
    <section id="sisterhood" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">The Sisterhood Portfolio</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Companies built or run by women
          </h2>
          <p className="mt-1 max-w-xl text-plum-soft">
            Your watchlist of founders and CEOs who said &ldquo;I&rsquo;ll do it myself.&rdquo;
            {demo && <span className="ml-1 chip bg-gold-soft text-gold">demo prices</span>}
          </p>
        </div>
        <div role="tablist" aria-label="Filter by sector" className="flex flex-wrap gap-1.5">
          {sectors.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={sector === s}
              onClick={() => setSector(s)}
              className={`chip border transition-colors ${
                sector === s ? "border-plum bg-plum text-cream" : "border-blush-deep bg-white/70 text-plum-soft hover:bg-blush"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => (
          <li key={s.ticker} className="card flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-semibold tracking-wider text-gold">{s.ticker}</p>
                <h3 className="font-display text-xl font-semibold leading-tight">{s.name}</h3>
                <p className="text-sm text-plum-soft">{s.herStory}</p>
              </div>
              <span className="chip shrink-0 bg-blush text-rose-deep">{s.sector}</span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold tabular-nums">{formatUsd(s.price, true)}</p>
                <ChangeChip value={s.changePct} />
              </div>
              <Sparkline data={s.history} label={`${s.name} 30-day trend`} />
            </div>

            <p className="font-display text-[0.95rem] italic text-plum-soft">&ldquo;{s.vibe}&rdquo;</p>

            <button
              onClick={() => addShares(s.ticker, 1)}
              disabled={pending === s.ticker}
              className="btn btn-ghost mt-auto self-start disabled:opacity-60"
            >
              {pending === s.ticker ? "Adding…" : owned.has(s.ticker) ? "+1 more share" : "Add 1 share (practice)"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
