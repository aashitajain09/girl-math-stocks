import "server-only";
import { BackendError } from "./backends";

/** Runs a handler and turns expected failures (bad input, not enough cash, signed out) into JSON errors. */
export async function respond<T>(run: () => Promise<T>, okStatus = 200) {
  try {
    return Response.json(await run(), { status: okStatus });
  } catch (e) {
    if (e instanceof BackendError) return Response.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
