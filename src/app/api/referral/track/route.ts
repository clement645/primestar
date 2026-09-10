import { NextRequest, NextResponse } from "next/server";
import { getClientIp, trackReferralClick } from "@/lib/referral";
import { REFERRAL_COOKIE_NAME } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

/**
 * Server-side referral tracking endpoint (sections 16-22, 57). Proxy
 * (src/proxy.ts) redirects here whenever it sees `?ref=`, rather than
 * querying Postgres itself — Netlify's Next.js Middleware runtime can't
 * load Prisma's native query engine binary, so all DB work for referral
 * attribution happens in this ordinary Route Handler (deployed as a full
 * Netlify Function) instead. This is also exactly the "hit a server-side
 * Netlify Function/API endpoint" architecture the spec called for.
 *
 * Flow: /some-page?ref=CODE -> proxy redirects here -> this route records
 * the click (or recognizes the IP was already counted), sets the
 * attribution cookie, and redirects back to the clean URL (no ?ref=), so
 * the visitor never sees this hop.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const redirectParam = request.nextUrl.searchParams.get("redirect") ?? "/";

  // Only ever redirect to a relative, same-site path — never let this
  // become an open redirect.
  const safeRedirect =
    redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/";

  const response = NextResponse.redirect(new URL(safeRedirect, request.url));

  if (!ref) return response;

  try {
    const ip = getClientIp(request.headers);
    const result = await trackReferralClick({
      referralCode: ref,
      ip,
      landingPage: safeRedirect,
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
}
