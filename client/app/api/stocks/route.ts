import { connection } from "next/server";
import { getStocks } from "@/lib/data";

// GET /api/stocks -> Sisterhood Portfolio (proxied from Spring, mock fallback)
export async function GET() {
  await connection(); // always fresh: prices change
  return Response.json(await getStocks());
}
