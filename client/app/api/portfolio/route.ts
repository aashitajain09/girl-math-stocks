import type { NextRequest } from "next/server";
import { respond } from "@/lib/respond";
import { getPortfolio, trade } from "@/lib/account";

// Practice portfolio for the signed-in user (Supabase). Simulated trades only.

const TICKER = /^[A-Za-z.]{1,6}$/;

function validShares(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 10_000;
}

// GET /api/portfolio -> cash, holdings (priced), recent trades
export async function GET() {
  return respond(getPortfolio);
}

// POST /api/portfolio { ticker, shares, side?: "buy" | "sell" } -> simulated trade at the current quote
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const { ticker, shares, side = "buy" } = (body ?? {}) as { ticker?: unknown; shares?: unknown; side?: unknown };
  if (typeof ticker !== "string" || !TICKER.test(ticker)) {
    return Response.json({ error: "ticker must be a stock symbol like ULTA." }, { status: 400 });
  }
  if (side !== "buy" && side !== "sell") {
    return Response.json({ error: "side must be buy or sell." }, { status: 400 });
  }
  if (!validShares(shares)) {
    return Response.json({ error: "shares must be a positive number." }, { status: 400 });
  }
  return respond(() => trade({ ticker: ticker.toUpperCase(), side, shares }), 201);
}

// DELETE /api/portfolio?ticker=ULTA&shares=1 -> sell. Omit shares to sell the whole position.
export async function DELETE(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const ticker = params.get("ticker") ?? "";
  if (!TICKER.test(ticker)) {
    return Response.json({ error: "ticker must be a stock symbol like ULTA." }, { status: 400 });
  }
  const rawShares = params.get("shares");
  const shares = rawShares === null ? undefined : Number(rawShares);
  if (shares !== undefined && !validShares(shares)) {
    return Response.json({ error: "shares must be a positive number." }, { status: 400 });
  }
  return respond(() => trade({ ticker: ticker.toUpperCase(), side: "sell", shares }));
}
