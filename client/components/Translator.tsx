"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DictionaryResponse, GlossaryEntry } from "@/lib/types";
import { usePortfolio } from "./PortfolioContext";

export function Translator({ initial }: { initial: GlossaryEntry[] }) {
  const { extras, toggleLearned } = usePortfolio();
  const learned = new Set(extras.learnedTerms);
  const learnedCount = initial.filter((e) => learned.has(e.id)).length;
  const tags = useMemo(() => Array.from(new Set(initial.map((e) => e.tag))), [initial]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [entries, setEntries] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ q: query, tag });
        const res = await fetch(`/api/dictionary?${qs}`, { signal: ctrl.signal });
        const data = (await res.json()) as DictionaryResponse;
        setEntries(data.entries);
      } catch {
        /* aborted or offline: keep showing the last results */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, tag]);

  return (
    <section id="translator" className="scroll-mt-24">
      <p className="eyebrow">Wall Street → Girl Math</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">The Translator</h2>
      <p className="mt-1 max-w-xl text-plum-soft">
        Finance-bro jargon, decoded. Tap a card to see the textbook version, then mark it &ldquo;got it&rdquo;.
      </p>

      <div className="mt-4 max-w-md">
        <div className="flex justify-between text-xs font-semibold text-plum-soft">
          <span>Your fluency</span>
          <span className="tabular-nums">
            {learnedCount} / {initial.length} terms
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Terms learned"
          aria-valuemin={0}
          aria-valuemax={initial.length}
          aria-valuenow={learnedCount}
          className="mt-1 h-2 overflow-hidden rounded-full bg-blush"
        >
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500"
            style={{ width: `${initial.length ? (learnedCount / initial.length) * 100 : 0}%` }}
          />
        </div>
        {initial.length > 0 && learnedCount === initial.length && (
          <p className="mt-1 text-xs font-semibold text-gold">Fluent in Wall Street. Who&rsquo;s the finance bro now? 💅</p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="block w-full max-w-md">
          <span className="sr-only">Search terms</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “dividend” or “bear market”…"
            className="field"
          />
        </label>
        <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-1.5">
          {["", ...tags].map((t) => (
            <button
              key={t || "all"}
              type="button"
              onClick={() => setTag(t)}
              aria-pressed={tag === t}
              className={`chip border transition-colors ${
                tag === t ? "border-plum bg-plum text-cream" : "border-blush-deep bg-white/70 text-plum-soft hover:bg-blush"
              }`}
            >
              {t || "All topics"}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" className={`mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
        {entries.length === 0 && (
          <p className="text-plum-soft">
            No translation yet for &ldquo;{query}&rdquo;{tag && <> in {tag}</>}. Add it to the wishlist? 💌
          </p>
        )}
        {entries.map((e) => {
          const showWs = !!flipped[e.id];
          const gotIt = learned.has(e.id);
          return (
            <div
              key={e.id}
              className={`card flex flex-col gap-2 p-5 transition-colors ${showWs ? "bg-plum! text-cream" : ""}`}
            >
              <button
                type="button"
                onClick={() => setFlipped((f) => ({ ...f, [e.id]: !f[e.id] }))}
                aria-pressed={showWs}
                className="flex flex-1 flex-col gap-2 text-left"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-display text-lg font-semibold">{e.term}</span>
                  <span className={`chip ${showWs ? "bg-white/15 text-cream" : "bg-gold-soft text-gold"}`}>{e.tag}</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  {showWs ? "Wall Street says" : "Girl math says"}
                </span>
                <span className={showWs ? "text-sm" : "font-display italic"}>{showWs ? e.wallStreet : e.girlMath}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleLearned(e.id)}
                aria-pressed={gotIt}
                className={`chip mt-1 self-start border transition-colors ${
                  gotIt
                    ? "border-gain bg-gain-soft text-gain"
                    : showWs
                      ? "border-white/30 text-cream hover:bg-white/10"
                      : "border-blush-deep text-plum-soft hover:bg-blush"
                }`}
              >
                {gotIt ? "✓ Got it" : "Mark as got it"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
