import type { NextRequest } from "next/server";
import { getStock } from "@/lib/data";

// GET /api/stocks/:ticker
export async function GET(_req: NextRequest, ctx: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await ctx.params;
  const stock = await getStock(ticker);
  if (!stock) {
    return Response.json({ error: `We couldn't find ${ticker.toUpperCase()} in the Sisterhood (yet).` }, { status: 404 });
  }
  return Response.json(stock);
}
