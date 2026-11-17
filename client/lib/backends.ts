// Server-only helpers for talking to the two backend services.
// Used by the Next.js route handlers in app/api/* (the "backend-for-frontend").

const NODE_API_URL = process.env.NODE_API_URL ?? "http://localhost:5050";
const SPRING_API_URL = process.env.SPRING_API_URL ?? "http://localhost:8080";

const TIMEOUT_MS = 2500;

export type Backend = "node" | "spring";

function baseUrl(backend: Backend) {
  return backend === "node" ? NODE_API_URL : SPRING_API_URL;
}

/** The backend is up and rejected the request (4xx). Not a reason to fall back to mock data. */
export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Call a backend and parse JSON. Returns `null` if the service is down, slow,
 * or fails (5xx) — callers then fall back to mock data so the UI keeps working.
 * Throws {@link BackendError} on a 4xx, so validation errors reach the user.
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
    if (res.status >= 400 && res.status < 500) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new BackendError(res.status, body?.error ?? `Request failed (${res.status}).`);
    }
    if (!res.ok) {
      console.warn(`[bff] ${backend} ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof BackendError) throw err;
    console.warn(`[bff] ${backend} ${path} unreachable, using mock data`, (err as Error).message);
    return null;
  }
}
