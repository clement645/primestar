import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { getClientIp, trackReferralClick } from "@/lib/referral";
import { REFERRAL_COOKIE_NAME, VISITOR_COOKIE_NAME } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";

// Next.js Proxy always runs on the Node.js runtime, so it can talk to
// Postgres via Prisma directly — this is the server-side enforcement point
// for the "one counted click per IP per worker" rule (sections 16-22, 57).
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

export default auth(async (request) => {
  const { pathname } = request.nextUrl;

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

  const response = NextResponse.next();

  // Ensure every visitor has an anonymous, non-identifying visitor id used
  // only to correlate a browsing session with a later WhatsApp click.
  if (!request.cookies.get(VISITOR_COOKIE_NAME)) {
    response.cookies.set(VISITOR_COOKIE_NAME, randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) return response;

  try {
    const ip = getClientIp(request.headers);
    const result = await trackReferralClick({
      referralCode: ref,
      ip,
      landingPage: pathname,
      deviceType: /mobile/i.test(request.headers.get("user-agent") ?? "")
        ? "mobile"
        : "desktop",
    });

    // Only attribute the visit if the code turned out to be valid & active.
    // Invalid/disabled codes are silently ignored — the site works normally
    // (section 47, tests 6 & 7).
    if (result.status === "counted" || result.status === "duplicate") {
      const settings = await getSiteSettings();
      response.cookies.set(REFERRAL_COOKIE_NAME, ref, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * settings.referralAttributionDays,
        path: "/",
      });
    }
  } catch (err) {
    // Never break the customer experience because of a tracking failure.
    console.error("referral tracking error", err);
  }

  return response;
});
