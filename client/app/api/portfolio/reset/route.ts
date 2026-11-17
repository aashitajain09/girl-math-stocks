import { resetAccount } from "@/lib/account";
import { respond } from "@/lib/respond";

// POST /api/portfolio/reset -> clear holdings and trades, restore starting cash
export async function POST() {
  return respond(resetAccount);
}
