import { connection } from "next/server";
import { getScenarios } from "@/lib/data";

// GET /api/scenarios -> "Free Money" calculator presets (proxied from Node)
export async function GET() {
  await connection();
  return Response.json({ scenarios: await getScenarios() });
}
