import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { VISITOR_COOKIE_NAME } from "@/lib/constants";

// IMPORTANT: this file (and everything it imports) must never pull in
// Prisma — Netlify's Next.js Middleware runtime can't load Prisma's native
// query engine binary (`libquery_engine-*.so.node`), which broke the
// original version of this proxy. Role checks use `authConfig` (a
// Prisma-free, JWT-only Auth.js config — see auth.config.ts) rather than
// the full `auth` export from src/auth.ts. Referral click tracking, which
// does need Postgres, is delegated to /api/referral/track — an ordinary
// Route Handler deployed as a full Netlify Function.
const { auth } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|map)$).*)",
  ],
};

const ROLE_GUARDS: { prefix: string; role: "ADMIN" | "WORKER" | "FARMER" }[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/worker/dashboard", role: "WORKER" },
  { prefix: "/farmer/dashboard", role: "FARMER" },
];

export default auth((request) => {
  const { pathname, searchParams } = request.nextUrl;

  // Authorization is enforced HERE, before any page component runs — not
  // via redirect() inside the page/layout. Next's streaming renderer can
  // still evaluate (and leak, into the redirect response body) a blocked
  // page's data-fetching if the redirect only happens deep in the React
  // tree, so the gate must sit in front of rendering entirely.
  const guard = ROLE_GUARDS.find((g) => pathname.startsWith(g.prefix));
  if (guard) {
    const role = (request.auth?.user as { role?: string } | undefined)?.role;
    if (!request.auth || role !== guard.role) {
      const loginUrl = new URL(`/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  if (pathname === "/dashboard" && !request.auth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Referral capture: hand off to the DB-backed tracking route rather than
  // touching Postgres here (see note above), then it redirects back to a
  // clean URL with no ?ref= — invisible to the visitor beyond one hop.
  const ref = searchParams.get("ref");
  if (ref) {
    const cleanUrl = new URL(pathname, request.url);
    searchParams.forEach((value, key) => {
      if (key !== "ref") cleanUrl.searchParams.set(key, value);
    });

    const trackUrl = new URL("/api/referral/track", request.url);
    trackUrl.searchParams.set("ref", ref);
    trackUrl.searchParams.set("redirect", cleanUrl.pathname + cleanUrl.search);

    const response = NextResponse.redirect(trackUrl);
    setVisitorCookieIfMissing(request, response);
    return response;
  }

  const response = NextResponse.next();
  setVisitorCookieIfMissing(request, response);
  return response;
});

function setVisitorCookieIfMissing(request: NextRequest, response: NextResponse) {
  if (!request.cookies.get(VISITOR_COOKIE_NAME)) {
    response.cookies.set(VISITOR_COOKIE_NAME, randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
}
