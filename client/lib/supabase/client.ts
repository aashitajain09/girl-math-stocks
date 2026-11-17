import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/** Supabase client for Client Components. Row-level security limits it to the signed-in user's rows. */
export function createClient() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
