import { connection, type NextRequest } from "next/server";
import { addHolding, getPortfolio } from "@/lib/data";

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
  if (typeof ticker !== "string" || !/^[A-Za-z.]{1,6}$/.test(ticker)) {
    return Response.json({ error: "ticker must be a stock symbol like ULTA." }, { status: 400 });
  }
  if (typeof shares !== "number" || !Number.isFinite(shares) || shares <= 0 || shares > 10_000) {
    return Response.json({ error: "shares must be a positive number." }, { status: 400 });
  }
  return Response.json(await addHolding({ ticker: ticker.toUpperCase(), shares }), { status: 201 });
}
