import { connection, type NextRequest } from "next/server";
import { BackendError } from "@/lib/backends";
import { addHolding, getPortfolio, sellHolding } from "@/lib/data";
import type { PortfolioResponse } from "@/lib/types";

const TICKER = /^[A-Za-z.]{1,6}$/;

function validShares(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 10_000;
}

/** Turns a 4xx from Spring (or the mock) into a JSON error the UI can show. */
async function respond(run: () => Promise<PortfolioResponse>, okStatus = 200) {
  try {
    return Response.json(await run(), { status: okStatus });
  } catch (e) {
    if (e instanceof BackendError) return Response.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

// GET /api/portfolio -> current holdings, priced
export async function GET() {
  await connection();
  return Response.json(await getPortfolio());
}

// POST /api/portfolio { ticker, shares } -> add to holdings (simulated, no real trades)
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const { ticker, shares } = (body ?? {}) as { ticker?: unknown; shares?: unknown };
  if (typeof ticker !== "string" || !TICKER.test(ticker)) {
    return Response.json({ error: "ticker must be a stock symbol like ULTA." }, { status: 400 });
  }
  if (!validShares(shares)) {
    return Response.json({ error: "shares must be a positive number." }, { status: 400 });
  }
  return respond(() => addHolding({ ticker: ticker.toUpperCase(), shares }), 201);
}

// DELETE /api/portfolio?ticker=ULTA&shares=1 -> sell (simulated). Omit shares to sell it all.
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
  return respond(() => sellHolding({ ticker: ticker.toUpperCase(), shares }));
}
