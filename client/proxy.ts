import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Pages and APIs anyone can see without an account. */
const PUBLIC_PATHS = ["/login", "/signup", "/auth/"];
const PUBLIC_APIS = ["/api/stocks", "/api/dictionary", "/api/quote", "/api/scenarios"];

/**
 * Refreshes the Supabase session cookie on every request and sends signed-out
 * visitors to /login. This is an optimistic check; every data read and write
 * re-checks the user on the server (and Postgres RLS checks again).
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Email links that land on the site root with a PKCE code: finish sign-in.
  if (pathname === "/" && searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Don't put code between createServerClient and getClaims(): it refreshes the session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || PUBLIC_APIS.some((p) => pathname.startsWith(p));

  if (!signedIn && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Sign in to see your portfolio." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (signedIn && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip static files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
