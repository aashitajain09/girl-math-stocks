import type { NextRequest } from "next/server";
import { getDictionary } from "@/lib/data";

// GET /api/dictionary?q=dividend -> Girl Math translations (proxied from Node)
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return Response.json(await getDictionary(q.slice(0, 80)));
}
