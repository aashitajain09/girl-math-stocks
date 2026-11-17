"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser, PortfolioResponse, SavedScenario, UserExtras } from "@/lib/types";

interface AccountCtx {
  user: CurrentUser;
  portfolio: PortfolioResponse;
  extras: UserExtras;
  /** Ticker (or action key) currently in flight, for button spinners. */
  pending: string | null;
  error: string | null;
  clearError: () => void;
  addShares: (ticker: string, shares: number) => Promise<void>;
  /** Omit `shares` to sell the whole position. */
  sellShares: (ticker: string, shares?: number) => Promise<void>;
  resetAccount: () => Promise<void>;
  toggleWatch: (ticker: string) => Promise<void>;
  toggleLearned: (termId: string) => Promise<void>;
  saveScenario: (s: Omit<SavedScenario, "id">) => Promise<void>;
  deleteScenario: (id: string) => Promise<void>;
}

const Ctx = createContext<AccountCtx | null>(null);

/**
 * The signed-in user's account state, shared by every dashboard section.
 * Trades go through /api/portfolio (server-priced). Personal lists write straight to
 * Supabase from the browser; row-level security limits them to this user's rows.
 */
export function PortfolioProvider({
  user,
  initial,
  initialExtras,
  children,
}: {
  user: CurrentUser;
  initial: PortfolioResponse;
  initialExtras: UserExtras;
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(initial);
  const [extras, setExtras] = useState(initialExtras);
  const extrasRef = useRef(extras);
  useEffect(() => {
    extrasRef.current = extras;
  }, [extras]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async (key: string, input: string, init: RequestInit) => {
    setPending(key);
    setError(null);
    try {
      const res = await fetch(input, init);
      const data = await res.json();
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Something went sideways.");
      setPortfolio(data as PortfolioResponse);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }, [router]);

  const addShares = useCallback(
    (ticker: string, shares: number) =>
      callApi(ticker, "/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, shares, side: "buy" }),
      }),
    [callApi],
  );

  const sellShares = useCallback(
    (ticker: string, shares?: number) => {
      const qs = new URLSearchParams({ ticker });
      if (shares) qs.set("shares", String(shares));
      return callApi(ticker, `/api/portfolio?${qs}`, { method: "DELETE" });
    },
    [callApi],
  );

  const resetAccount = useCallback(() => callApi("reset", "/api/portfolio/reset", { method: "POST" }), [callApi]);

  /** Optimistic update for personal lists; rolls back and shows an error if the write fails. */
  const mutate = useCallback(
    async (next: (e: UserExtras) => UserExtras, write: () => PromiseLike<{ error: { message: string } | null }>) => {
      const before = extrasRef.current;
      setExtras(next(before));
      const { error: err } = await write();
      if (err) {
        setExtras(before);
        setError(`Couldn't save that: ${err.message}`);
      }
    },
    [],
  );

  const toggleWatch = useCallback(
    (ticker: string) => {
      const on = extras.watchlist.includes(ticker);
      return mutate(
        (e) => ({ ...e, watchlist: on ? e.watchlist.filter((t) => t !== ticker) : [...e.watchlist, ticker] }),
        () =>
          on
            ? supabase.from("watchlist").delete().eq("ticker", ticker)
            : supabase.from("watchlist").insert({ user_id: user.id, ticker }),
      );
    },
    [extras.watchlist, mutate, supabase, user.id],
  );

  const toggleLearned = useCallback(
    (termId: string) => {
      const on = extras.learnedTerms.includes(termId);
      return mutate(
        (e) => ({
          ...e,
          learnedTerms: on ? e.learnedTerms.filter((t) => t !== termId) : [...e.learnedTerms, termId],
        }),
        () =>
          on
            ? supabase.from("learned_terms").delete().eq("term_id", termId)
            : supabase.from("learned_terms").insert({ user_id: user.id, term_id: termId }),
      );
    },
    [extras.learnedTerms, mutate, supabase, user.id],
  );

  const saveScenario = useCallback(
    async (s: Omit<SavedScenario, "id">) => {
      setPending("save-scenario");
      setError(null);
      const { data, error: err } = await supabase
        .from("saved_scenarios")
        .insert({
          user_id: user.id,
          label: s.label,
          emoji: s.emoji,
          amount: s.amount,
          per_year: s.perYear,
          years: s.years,
          rate_pct: s.ratePct,
        })
        .select("id")
        .single();
      setPending(null);
      if (err || !data) {
        setError(`Couldn't save that scenario: ${err?.message ?? "unknown error"}`);
        return;
      }
      setExtras((e) => ({ ...e, savedScenarios: [{ ...s, id: data.id }, ...e.savedScenarios] }));
    },
    [supabase, user.id],
  );

  const deleteScenario = useCallback(
    (id: string) =>
      mutate(
        (e) => ({ ...e, savedScenarios: e.savedScenarios.filter((s) => s.id !== id) }),
        () => supabase.from("saved_scenarios").delete().eq("id", id),
      ),
    [mutate, supabase],
  );

  const value: AccountCtx = {
    user,
    portfolio,
    extras,
    pending,
    error,
    clearError: () => setError(null),
    addShares,
    sellShares,
    resetAccount,
    toggleWatch,
    toggleLearned,
    saveScenario,
    deleteScenario,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <ErrorToast />
    </Ctx.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortfolio must be used inside <PortfolioProvider>");
  return ctx;
}

/** Errors from any section (not enough cash, network hiccups) show here, wherever you clicked. */
function ErrorToast() {
  const { error, clearError } = usePortfolio();
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 6000);
    return () => clearTimeout(t);
  }, [error, clearError]);
  if (!error) return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-loss/30 bg-loss-soft p-4 text-sm text-loss shadow-lg"
    >
      <span className="flex-1">{error}</span>
      <button type="button" onClick={clearError} aria-label="Dismiss" className="font-semibold">
        ✕
      </button>
    </div>
  );
}
