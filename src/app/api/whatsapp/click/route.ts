import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { REFERRAL_COOKIE_NAME, VISITOR_COOKIE_NAME } from "@/lib/constants";
import { getClientIp, trackWhatsappClick } from "@/lib/referral";

export const runtime = "nodejs";

/**
 * Records a WhatsApp Click event (section 24). This is distinct from an
 * actual WhatsApp message — the site can only know the button was clicked
 * (section 25). Never trusted from the client for anything beyond the page
 * name; worker attribution comes from the server-verified referral cookie.
 *
 * Counted at most once per (worker, IP) — same anti-inflation rule as
 * referral clicks, enforced by a database UNIQUE constraint.
 */
export async function POST(request: NextRequest) {
  let page = "unknown";
  try {
    const body = await request.json();
    if (typeof body?.page === "string") page = body.page.slice(0, 255);
  } catch {
    // ignore malformed body, still record the event
  }

  const referralCode = request.cookies.get(REFERRAL_COOKIE_NAME)?.value ?? null;
  const visitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value ?? null;

  let workerId: string | null = null;
  if (referralCode) {
    const worker = await prisma.worker.findUnique({
      where: { referralCode },
      select: { id: true, status: true },
    });
    if (worker && worker.status === "ACTIVE") workerId = worker.id;
  }

  await trackWhatsappClick({
    workerId,
    referralCode: workerId ? referralCode : null,
    ip: getClientIp(request.headers),
    page,
    visitorId,
  });

  return NextResponse.json({ ok: true });
}
