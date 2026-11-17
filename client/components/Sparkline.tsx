interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  label: string;
}

/** Tiny trend line. Color follows direction over the window (first vs last point). */
export function Sparkline({ data, width = 120, height = 36, label }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 2;
  const step = (width - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, pad + (1 - (v - min) / span) * (height - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${height} L${pts[0][0].toFixed(1)},${height} Z`;
  const up = data[data.length - 1] >= data[0];
  const stroke = up ? "var(--color-gain)" : "var(--color-loss)";
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="overflow-visible">
      <path d={area} fill={stroke} opacity={0.08} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={2.5} fill={stroke} />
    </svg>
  );
}
