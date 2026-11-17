"use client";

import { formatPct, formatUsd } from "@/lib/finance";
import type { Trade } from "@/lib/types";
import { usePortfolio } from "./PortfolioContext";

export function MyPortfolio() {
  const { portfolio, addShares, sellShares, resetAccount, pending } = usePortfolio();
  const { positions, holdingsValue, totalGain, cash, startingCash, netWorth, trades } = portfolio;
  const sinceStart = netWorth - startingCash;
  const up = sinceStart >= 0;
  const realized = trades.reduce((a, t) => a + (t.realizedGain ?? 0), 0);

  const onReset = () => {
    if (window.confirm(`Start fresh? This clears your holdings and trade history and gives you ${formatUsd(startingCash)} in practice cash again.`)) {
      void resetAccount();
    }
  };

  return (
    <section id="my-portfolio" className="scroll-mt-24">
      <p className="eyebrow">My practice portfolio</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your closet of shares</h2>
      <p className="mt-1 max-w-xl text-plum-soft">
        Pretend money, real lessons. Buy, trim, or let it go: it&rsquo;s a closet clean-out, not a breakup.
      </p>

      <div className="card mt-5 overflow-hidden">
        {/* Summary */}
        <div className="grid gap-4 border-b border-blush-deep/40 bg-blush/40 p-5 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-sm text-plum-soft">Net worth</p>
            <p className="font-display text-4xl font-semibold tabular-nums">{formatUsd(netWorth, true)}</p>
            <p className={`text-sm font-semibold ${up ? "text-gain" : "text-loss"}`}>
              {up ? "Up" : "Down"} {formatUsd(Math.abs(sinceStart), true)} since you started
              <span className="ml-1 font-normal text-plum-soft">
                {up ? "· that's girl math profit" : "· only a loss if you sell, bestie"}
              </span>
            </p>
          </div>
          <Stat label="Practice cash" value={formatUsd(cash, true)} hint="ready to spend" />
          <Stat label="Invested" value={formatUsd(holdingsValue, true)} hint={`${formatUsd(totalGain, true)} unrealized`} />
          <Stat
            label="Locked-in gains"
            value={formatUsd(realized, true)}
            hint="from recent sells"
            tone={realized > 0 ? "gain" : realized < 0 ? "loss" : undefined}
          />
        </div>

        {positions.length === 0 ? (
          <p className="p-6 text-plum-soft">
            Nothing here yet. You&rsquo;ve got {formatUsd(cash)} to play with: tap &ldquo;Buy 1 share&rdquo; on any
            Sisterhood card to start.
          </p>
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
                  <th className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Adjust</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.ticker} className="border-t border-blush-deep/30">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-gold">{p.ticker}</span>{" "}
                      <span className="font-medium">{p.name}</span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatShares(p.shares)}</td>
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
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Receipts trades={trades} />
        <div className="card flex flex-col gap-3 p-5">
          <h3 className="font-display text-xl font-semibold">Fresh start</h3>
          <p className="text-sm text-plum-soft">
            Learned a lesson and want a clean slate? Reset clears your holdings and receipts and gives you{" "}
            {formatUsd(startingCash)} again. Your watchlist, saved scenarios and translator progress stay.
          </p>
          <button
            type="button"
            onClick={onReset}
            disabled={!!pending}
            className="btn btn-ghost mt-auto self-start disabled:opacity-50"
          >
            {pending === "reset" ? "Resetting…" : "Reset my practice account"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Receipts({ trades }: { trades: Trade[] }) {
  return (
    <div className="card p-5">
      <h3 className="font-display text-xl font-semibold">The receipts</h3>
      <p className="text-sm text-plum-soft">Every practice trade, saved to your account.</p>
      {trades.length === 0 ? (
        <p className="mt-4 text-sm text-plum-soft">No trades yet. Your first one will show up here.</p>
      ) : (
        <ul className="mt-3 max-h-80 divide-y divide-blush-deep/30 overflow-y-auto">
          {trades.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <span className={`chip mr-2 ${t.side === "buy" ? "bg-gold-soft text-gold" : "bg-blush text-rose-deep"}`}>
                  {t.side === "buy" ? "Bought" : "Sold"}
                </span>
                <span className="tabular-nums">{formatShares(t.shares)}</span>{" "}
                <span className="font-mono text-xs font-semibold">{t.ticker}</span>{" "}
                <span className="text-plum-soft">@ {formatUsd(t.price, true)}</span>
                <span className="block text-xs text-plum-soft/80" suppressHydrationWarning>{formatWhen(t.createdAt)}</span>
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <span>{formatUsd(t.total, true)}</span>
                {t.realizedGain !== null && (
                  <span className={`block text-xs font-semibold ${t.realizedGain >= 0 ? "text-gain" : "text-loss"}`}>
                    {t.realizedGain >= 0 ? "+" : "−"}
                    {formatUsd(Math.abs(t.realizedGain), true)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "gain" | "loss" }) {
  return (
    <div>
      <p className="text-sm text-plum-soft">{label}</p>
      <p className={`font-display text-2xl font-semibold tabular-nums ${tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : ""}`}>
        {value}
      </p>
      <p className="text-xs text-plum-soft">{hint}</p>
    </div>
  );
}

function formatShares(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/0+$/, "");
}

const when = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
function formatWhen(iso: string) {
  return when.format(new Date(iso));
}
