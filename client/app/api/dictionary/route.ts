import type { NextRequest } from "next/server";
import { getDictionary } from "@/lib/data";

// GET /api/dictionary?q=dividend&tag=Strategy -> Girl Math translations (proxied from Node)
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = (params.get("q") ?? "").slice(0, 80);
  const tag = (params.get("tag") ?? "").slice(0, 40);
  return Response.json(await getDictionary(q, tag));
}
