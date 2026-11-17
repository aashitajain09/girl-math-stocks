// Server-only helpers for talking to the two backend services.
// Used by the Next.js route handlers in app/api/* (the "backend-for-frontend").

const NODE_API_URL = process.env.NODE_API_URL ?? "http://localhost:5050";
const SPRING_API_URL = process.env.SPRING_API_URL ?? "http://localhost:8080";

const TIMEOUT_MS = 2500;

export type Backend = "node" | "spring";

function baseUrl(backend: Backend) {
  return backend === "node" ? NODE_API_URL : SPRING_API_URL;
}

/**
 * Call a backend and parse JSON. Returns `null` if the service is down,
 * slow, or errors — callers then fall back to mock data so the UI keeps working.
 */
export async function callBackend<T>(
  backend: Backend,
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl(backend)}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[bff] ${backend} ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[bff] ${backend} ${path} unreachable, using mock data`, (err as Error).message);
    return null;
  }
}
