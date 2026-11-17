"use client";

import { useId, useMemo, useState } from "react";
import type { SavedScenario, Scenario } from "@/lib/types";
import { formatUsd, projectGrowth, type GrowthPoint } from "@/lib/finance";
import { usePortfolio } from "./PortfolioContext";

const YEAR_OPTIONS = [5, 10, 20, 30];

export function FreeMoneyCalculator({ scenarios }: { scenarios: Scenario[] }) {
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "custom");
  const preset = scenarios.find((s) => s.id === scenarioId);
  const [amount, setAmount] = useState(preset?.amount ?? 5);
  const [perYear, setPerYear] = useState(preset?.perYear ?? 52);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(7);
  const ids = { amount: useId(), freq: useId(), rate: useId() };
  const { extras, saveScenario, deleteScenario, pending } = usePortfolio();
  const [justSaved, setJustSaved] = useState(false);

  const pick = (s: Scenario) => {
    setScenarioId(s.id);
    setAmount(s.amount);
    setPerYear(s.perYear);
  };

  const annual = Math.max(0, amount) * Math.max(0, perYear);
  const points = useMemo(() => projectGrowth(annual, years, rate), [annual, years, rate]);
  const end = points[points.length - 1];
  const freeMoney = end.value - end.contributed;

  const onSave = async () => {
    await saveScenario({
      label: preset?.label ?? "My custom treat",
      emoji: preset?.emoji ?? "✨",
      amount: Math.max(0, amount),
      perYear: Math.max(0, Math.round(perYear)),
      years,
      ratePct: rate,
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const load = (s: SavedScenario) => {
    setScenarioId(scenarios.find((p) => p.label === s.label)?.id ?? "custom");
    setAmount(s.amount);
    setPerYear(s.perYear);
    setYears(s.years);
    setRate(s.ratePct);
  };

  return (
    <section id="free-money" className="scroll-mt-24">
      <p className="eyebrow">The &ldquo;Free Money&rdquo; Calculator</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">What could your treat become?</h2>
      <p className="mt-1 max-w-xl text-plum-soft">
        Not saying skip the latte. Saying: know what it&rsquo;s worth. Then decide like the CEO you are.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="card flex flex-col gap-5 p-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Pick your treat</legend>
            <div className="grid grid-cols-2 gap-2">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pick(s)}
                  aria-pressed={scenarioId === s.id}
                  className={`rounded-2xl border p-3 text-left text-sm transition-colors ${
                    scenarioId === s.id ? "border-plum bg-plum text-cream" : "border-blush-deep bg-white hover:bg-blush"
                  }`}
                >
                  <span className="text-lg" aria-hidden>{s.emoji}</span>
                  <span className="block font-semibold leading-snug">{s.label}</span>
                </button>
              ))}
            </div>
            {preset && <p className="mt-2 text-sm italic text-plum-soft">{preset.quip}</p>}
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <label htmlFor={ids.amount} className="text-sm font-semibold">
              Cost each time
              <input
                id={ids.amount}
                type="number"
                min={0}
                step={0.5}
                value={amount}
                onChange={(e) => { setAmount(Number(e.target.value)); setScenarioId("custom"); }}
                className="field mt-1"
              />
            </label>
            <label htmlFor={ids.freq} className="text-sm font-semibold">
              Times per year
              <input
                id={ids.freq}
                type="number"
                min={0}
                step={1}
                value={perYear}
                onChange={(e) => { setPerYear(Number(e.target.value)); setScenarioId("custom"); }}
                className="field mt-1"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">For how long?</p>
            <div className="flex gap-2">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  aria-pressed={years === y}
                  className={`chip border px-3 py-1.5 text-sm ${years === y ? "border-plum bg-plum text-cream" : "border-blush-deep bg-white"}`}
                >
                  {y} yrs
                </button>
              ))}
            </div>
          </div>

          <label htmlFor={ids.rate} className="text-sm font-semibold">
            Assumed yearly return: <span className="tabular-nums text-rose-deep">{rate}%</span>
            <input
              id={ids.rate}
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-2 w-full accent-rose"
            />
          </label>
        </div>

        <div className="card flex flex-col gap-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="You'd spend" value={formatUsd(end.contributed)} />
            <Stat label="Could grow to" value={formatUsd(end.value)} accent />
            <Stat label="“Free money”" value={formatUsd(freeMoney)} gold />
          </div>
          <GrowthChart points={points} />
          <p className="text-sm text-plum-soft">
            Girl math verdict: that&rsquo;s <strong className="text-plum">{formatUsd(annual)}/yr</strong> on{" "}
            {preset?.label.toLowerCase() ?? "this treat"}. Invested for {years} years, the growth alone is{" "}
            <strong className="text-gold">{formatUsd(freeMoney)}</strong> you never had to earn.
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={pending === "save-scenario"}
            className="btn btn-primary self-start disabled:opacity-60"
          >
            {justSaved ? "Saved ✓" : pending === "save-scenario" ? "Saving…" : "Save this scenario"}
          </button>
          <p className="text-xs text-plum-soft/80">
            Hypothetical illustration with monthly compounding at a constant rate. Real returns vary, can be negative, and
            aren&rsquo;t guaranteed. This is education, not financial advice.
          </p>
        </div>
      </div>

      {extras.savedScenarios.length > 0 && (
        <div className="mt-5">
          <h3 className="font-display text-xl font-semibold">Your saved scenarios</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {extras.savedScenarios.map((s) => {
              const pts = projectGrowth(s.amount * s.perYear, s.years, s.ratePct);
              const last = pts[pts.length - 1];
              return (
                <li key={s.id} className="card flex items-start gap-3 p-4">
                  <span className="text-2xl" aria-hidden>{s.emoji ?? "✨"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">{s.label}</p>
                    <p className="text-xs text-plum-soft">
                      {formatUsd(s.amount, s.amount % 1 !== 0)} × {s.perYear}/yr · {s.years} yrs · {s.ratePct}%
                    </p>
                    <p className="mt-1 text-sm">
                      could become <b className="text-rose-deep tabular-nums">{formatUsd(last.value)}</b>
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => load(s)} className="chip border border-blush-deep bg-white hover:bg-blush">
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteScenario(s.id)}
                        aria-label={`Delete saved scenario ${s.label}`}
                        className="chip text-plum-soft hover:bg-loss-soft hover:text-loss"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, accent, gold }: { label: string; value: string; accent?: boolean; gold?: boolean }) {
  return (
    <div className="rounded-2xl bg-cream-deep/70 p-3">
      <p className="text-xs text-plum-soft">{label}</p>
      <p className={`font-display text-xl font-semibold tabular-nums sm:text-2xl ${accent ? "text-rose-deep" : gold ? "text-gold" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function GrowthChart({ points }: { points: GrowthPoint[] }) {
  const w = 560;
  const h = 200;
  const padL = 8;
  const padB = 22;
  const max = Math.max(1, ...points.map((p) => p.value));
  const n = points.length - 1 || 1;
  const x = (i: number) => padL + (i / n) * (w - padL * 2);
  const y = (v: number) => (h - padB) - (v / max) * (h - padB - 8);
  const path = (key: "value" | "contributed") =>
    points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
  const area = (key: "value" | "contributed") => `${path(key)} L${x(n)},${h - padB} L${x(0)},${h - padB} Z`;
  const ticks = points.filter((_, i) => i === 0 || i === n || i === Math.round(n / 2));

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Growth of invested spending over time versus amount contributed">
        <path d={area("value")} fill="var(--color-rose)" opacity={0.14} />
        <path d={area("contributed")} fill="var(--color-gold)" opacity={0.18} />
        <path d={path("value")} fill="none" stroke="var(--color-rose)" strokeWidth={2.5} strokeLinejoin="round" />
        <path d={path("contributed")} fill="none" stroke="var(--color-gold)" strokeWidth={2} strokeDasharray="5 4" />
        <line x1={padL} x2={w - padL} y1={h - padB} y2={h - padB} stroke="var(--color-blush-deep)" />
        {ticks.map((p) => (
          <text key={p.year} x={x(p.year)} y={h - 6} textAnchor={p.year === 0 ? "start" : p.year === n ? "end" : "middle"} fontSize={11} fill="var(--color-plum-soft)">
            {p.year === 0 ? "Today" : `Year ${p.year}`}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex gap-4 text-xs text-plum-soft">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-rose" /> If invested</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-gold" /> Just spent</span>
      </figcaption>
    </figure>
  );
}
