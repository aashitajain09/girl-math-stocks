import type { ReactNode } from "react";

export function AuthShell({ eyebrow, title, blurb, children }: { eyebrow: string; title: ReactNode; blurb: string; children: ReactNode }) {
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold italic tracking-tight">girl math</span>
          <span className="chip bg-gold-soft text-gold">stocks</span>
        </p>
        <p className="eyebrow mt-8">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-md text-plum-soft">{blurb}</p>
        <ul className="mt-6 space-y-2 text-sm text-plum-soft">
          <li>💸 $10,000 in practice cash to build your Sisterhood portfolio</li>
          <li>🧾 Every trade saved, with your wins (and lessons) tracked</li>
          <li>☕ Save your &ldquo;free money&rdquo; scenarios and watchlist</li>
        </ul>
      </div>
      <div className="card p-6 sm:p-8">{children}</div>
      <p className="text-xs text-plum-soft lg:col-span-2">
        Girl Math Stocks is for learning. Not financial advice. Practice portfolios use simulated trades with pretend money.
      </p>
    </main>
  );
}
