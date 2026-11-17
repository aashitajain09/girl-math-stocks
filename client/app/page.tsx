import { Suspense } from "react";
import { connection } from "next/server";
import { Header } from "@/components/Header";
import { SisterhoodPortfolio } from "@/components/SisterhoodPortfolio";
import { Translator } from "@/components/Translator";
import { FreeMoneyCalculator } from "@/components/FreeMoneyCalculator";
import { MyPortfolio } from "@/components/MyPortfolio";
import { PortfolioProvider } from "@/components/PortfolioContext";
import { ChangeChip } from "@/components/ChangeChip";
import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { redirect } from "next/navigation";
import { getCurrentUser, getPortfolio, getUserExtras } from "@/lib/account";
import { getDictionary, getQuote, getScenarios, getStocks } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-5 pb-20 pt-10">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </main>
      <footer className="border-t border-blush-deep/40 py-6 text-center text-xs text-plum-soft">
        Girl Math Stocks is for learning. Not financial advice. Practice portfolios use simulated trades.
      </footer>
    </>
  );
}

/**
 * Request-time data, fetched in parallel: stocks from Spring, content from Node,
 * and the signed-in user's account from Supabase.
 */
async function Dashboard() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stocksRes, portfolio, extras, quote, dictionary, scenarios] = await Promise.all([
    getStocks(),
    getPortfolio(),
    getUserExtras(),
    getQuote(),
    getDictionary(),
    getScenarios(),
  ]);

  const { stocks } = stocksRes;
  const avgChange = stocks.length ? stocks.reduce((a, s) => a + s.changePct, 0) / stocks.length : 0;
  const top = [...stocks].sort((a, b) => b.changePct - a.changePct)[0];

  return (
    <PortfolioProvider user={user} initial={portfolio} initialExtras={extras}>
      {/* Hero */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">
            {user.displayName ? `Hey ${user.displayName}, your money, but make it make sense` : "Your money, but make it make sense"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Investing is just <em className="text-rose">girl math</em> with a longer receipt.
          </h1>
          <blockquote className="mt-5 max-w-xl border-l-4 border-blush-deep pl-4">
            <p className="font-display text-lg italic text-plum-soft">&ldquo;{quote.quote}&rdquo;</p>
            <footer className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
              Today&rsquo;s girl math · {quote.category}
            </footer>
          </blockquote>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-xs text-plum-soft">Sisterhood index today</p>
            <p className="mt-1"><ChangeChip value={avgChange} /></p>
            <p className="mt-2 text-xs text-plum-soft">avg. across {stocks.length} companies</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-plum-soft">It girl of the day</p>
            <p className="mt-1 font-display text-xl font-semibold">{top?.ticker ?? "—"}</p>
            {top && <ChangeChip value={top.changePct} />}
          </div>
          <PortfolioSummaryCard />
        </div>
      </section>

      <SisterhoodPortfolio stocks={stocks} demo={stocksRes.demo} />
      <Translator initial={dictionary.entries} />
      <FreeMoneyCalculator scenarios={scenarios} />
      <MyPortfolio />

      {process.env.NODE_ENV === "development" && (
        <p className="text-xs text-plum-soft/70">
          dev · stocks from <b>{stocksRes.source}</b> · translator from <b>{dictionary.source}</b> · account from{" "}
          <b>supabase</b>
        </p>
      )}
    </PortfolioProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading your dashboard">
      <div className="h-40 rounded-3xl bg-blush/60" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-3xl bg-white/60" />
        ))}
      </div>
    </div>
  );
}
