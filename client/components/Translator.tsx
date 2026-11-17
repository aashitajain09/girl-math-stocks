"use client";

import { useEffect, useRef, useState } from "react";
import type { DictionaryResponse, GlossaryEntry } from "@/lib/types";

export function Translator({ initial }: { initial: GlossaryEntry[] }) {
  const [query, setQuery] = useState("");
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
        const res = await fetch(`/api/dictionary?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
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
  }, [query]);

  return (
    <section id="translator" className="scroll-mt-24">
      <p className="eyebrow">Wall Street → Girl Math</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">The Translator</h2>
      <p className="mt-1 max-w-xl text-plum-soft">
        Finance-bro jargon, decoded. Tap a card to see the textbook version.
      </p>

      <label className="mt-5 block max-w-md">
        <span className="sr-only">Search terms</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “dividend” or “bear market”…"
          className="field"
        />
      </label>

      <div aria-live="polite" className={`mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
        {entries.length === 0 && (
          <p className="text-plum-soft">No translation yet for &ldquo;{query}&rdquo;. Add it to the wishlist? 💌</p>
        )}
        {entries.map((e) => {
          const showWs = !!flipped[e.id];
          return (
            <button
              key={e.id}
              onClick={() => setFlipped((f) => ({ ...f, [e.id]: !f[e.id] }))}
              aria-pressed={showWs}
              className={`card flex flex-col gap-2 p-5 text-left transition-colors ${showWs ? "bg-plum! text-cream" : "hover:bg-white"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{e.term}</h3>
                <span className={`chip ${showWs ? "bg-white/15 text-cream" : "bg-gold-soft text-gold"}`}>{e.tag}</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                {showWs ? "Wall Street says" : "Girl math says"}
              </p>
              <p className={showWs ? "text-sm" : "font-display italic"}>{showWs ? e.wallStreet : e.girlMath}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
