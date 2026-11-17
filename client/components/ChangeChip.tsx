import { formatPct } from "@/lib/finance";

export function ChangeChip({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`chip ${up ? "bg-gain-soft text-gain" : "bg-loss-soft text-loss"}`}>
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      {formatPct(value)}
    </span>
  );
}
