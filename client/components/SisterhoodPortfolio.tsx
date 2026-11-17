"use client";

import { useMemo, useState } from "react";
import type { Stock } from "@/lib/types";
import { formatUsd } from "@/lib/finance";
import { ChangeChip } from "./ChangeChip";
import { Sparkline } from "./Sparkline";
import { usePortfolio } from "./PortfolioContext";

export function SisterhoodPortfolio({ stocks, demo }: { stocks: Stock[]; demo: boolean }) {
  const sectors = useMemo(() => ["All", "♡ Watchlist", ...Array.from(new Set(stocks.map((s) => s.sector)))], [stocks]);
  const [sector, setSector] = useState("All");
  const { addShares, pending, portfolio, extras, toggleWatch } = usePortfolio();
  const watching = new Set(extras.watchlist);
  const visible =
    sector === "All"
      ? stocks
      : sector === "♡ Watchlist"
        ? stocks.filter((s) => watching.has(s.ticker))
        : stocks.filter((s) => s.sector === sector);
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

      {visible.length === 0 && (
        <p className="card p-6 text-plum-soft">
          Your watchlist is empty. Tap the ♡ on any company to keep an eye on her.
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => (
          <li key={s.ticker} className="card flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-semibold tracking-wider text-gold">{s.ticker}</p>
                <h3 className="font-display text-xl font-semibold leading-tight">{s.name}</h3>
                <p className="text-sm text-plum-soft">{s.herStory}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="chip bg-blush text-rose-deep">{s.sector}</span>
                <button
                  type="button"
                  onClick={() => toggleWatch(s.ticker)}
                  aria-pressed={watching.has(s.ticker)}
                  aria-label={watching.has(s.ticker) ? `Remove ${s.name} from watchlist` : `Add ${s.name} to watchlist`}
                  className={`grid h-8 w-8 place-items-center rounded-full text-lg transition-colors ${
                    watching.has(s.ticker) ? "bg-rose text-cream" : "bg-white text-rose hover:bg-blush"
                  }`}
                >
                  {watching.has(s.ticker) ? "♥" : "♡"}
                </button>
              </div>
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
              disabled={!!pending || s.price > portfolio.cash}
              title={s.price > portfolio.cash ? "Not enough practice cash" : undefined}
              className="btn btn-ghost mt-auto self-start disabled:opacity-60"
            >
              {pending === s.ticker ? "Buying…" : owned.has(s.ticker) ? "Buy 1 more share" : `Buy 1 share · ${formatUsd(s.price)}`}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
