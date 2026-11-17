import { connection } from "next/server";
import { getQuote } from "@/lib/data";

// GET /api/quote -> a random girl math quote (proxied from Node)
export async function GET() {
  await connection();
  return Response.json(await getQuote());
}
