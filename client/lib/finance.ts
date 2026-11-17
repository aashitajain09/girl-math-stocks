// Pure math helpers used by the "Free Money" calculator.

export interface GrowthPoint {
  year: number;
  contributed: number;
  value: number;
}

/**
 * Future value of a recurring contribution, compounded monthly.
 * `annualSpend` is spread evenly across 12 monthly deposits.
 */
export function projectGrowth(annualSpend: number, years: number, annualReturnPct: number): GrowthPoint[] {
  const monthlyDeposit = annualSpend / 12;
  const r = annualReturnPct / 100 / 12;
  const points: GrowthPoint[] = [{ year: 0, contributed: 0, value: 0 }];
  let value = 0;
  for (let m = 1; m <= years * 12; m++) {
    value = value * (1 + r) + monthlyDeposit;
    if (m % 12 === 0) {
      points.push({ year: m / 12, contributed: monthlyDeposit * m, value });
    }
  }
  return points;
}

const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatUsd(n: number, cents = false) {
  return (cents ? usd2 : usd0).format(n);
}

export function formatPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
