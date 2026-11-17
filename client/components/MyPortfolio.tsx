"use client";

import { formatPct, formatUsd } from "@/lib/finance";
import { usePortfolio } from "./PortfolioContext";

export function MyPortfolio() {
  const { portfolio, error, addShares, sellShares, pending } = usePortfolio();
  const { positions, totalValue, totalGain } = portfolio;
  const up = totalGain >= 0;

  return (
    <section id="my-portfolio" className="scroll-mt-24">
      <p className="eyebrow">My practice portfolio</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight">Your closet of shares</h2>
      <p className="mt-1 text-plum-soft">
        Practice mode: no real money moves. Buy, trim, or let it go: it&rsquo;s a closet clean-out, not a breakup.
      </p>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-blush-deep/40 bg-blush/40 p-5">
          <div>
            <p className="text-sm text-plum-soft">Total value</p>
            <p className="font-display text-4xl font-semibold tabular-nums">{formatUsd(totalValue, true)}</p>
          </div>
          <p className={`text-sm font-semibold ${up ? "text-gain" : "text-loss"}`}>
            {up ? "Up" : "Down"} {formatUsd(Math.abs(totalGain), true)} all-time
            <span className="ml-1 font-normal text-plum-soft">
              {up ? "· that's girl math profit" : "· only a loss if you sell, bestie"}
            </span>
          </p>
        </div>

        {positions.length === 0 ? (
          <p className="p-6 text-plum-soft">Nothing here yet. Tap &ldquo;Add 1 share&rdquo; on any Sisterhood card to start.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-plum-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 text-right font-semibold">Shares</th>
                <th className="hidden px-5 py-3 text-right font-semibold sm:table-cell">Avg cost</th>
                <th className="px-5 py-3 text-right font-semibold">Value</th>
                <th className="px-5 py-3 text-right font-semibold">Gain</th>
                <th className="px-5 py-3 text-right font-semibold"><span className="sr-only">Adjust</span></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.ticker} className="border-t border-blush-deep/30">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-semibold text-gold">{p.ticker}</span>{" "}
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{p.shares}</td>
                  <td className="hidden px-5 py-3 text-right tabular-nums sm:table-cell">{formatUsd(p.avgCost, true)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatUsd(p.value, true)}</td>
                  <td className={`px-5 py-3 text-right tabular-nums ${p.gain >= 0 ? "text-gain" : "text-loss"}`}>
                    {formatPct(p.gainPct)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1" aria-busy={pending === p.ticker}>
                      <button
                        type="button"
                        onClick={() => sellShares(p.ticker, Math.min(1, p.shares))}
                        disabled={!!pending}
                        aria-label={`Sell 1 share of ${p.name}`}
                        className="btn btn-ghost h-8 w-8 p-0 disabled:opacity-50"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => addShares(p.ticker, 1)}
                        disabled={!!pending}
                        aria-label={`Buy 1 more share of ${p.name}`}
                        className="btn btn-ghost h-8 w-8 p-0 disabled:opacity-50"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => sellShares(p.ticker)}
                        disabled={!!pending}
                        aria-label={`Sell all ${p.name}`}
                        className="btn hidden h-8 px-3 text-xs text-plum-soft hover:bg-blush disabled:opacity-50 sm:inline-flex"
                      >
                        Sell all
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        {error && <p role="alert" className="border-t border-blush-deep/40 bg-loss-soft px-5 py-3 text-sm text-loss">{error}</p>}
      </div>
    </section>
  );
}
