import crypto from "crypto";
import { prisma } from "@/lib/db";

/**
 * Hash a raw IP address with a server-side secret (HMAC-SHA256).
 * Raw IPs are never persisted — only this hash is stored, so the
 * database never holds an address that can identify a visitor on its own.
 */
export function hashIp(ip: string): string {
  const secret = process.env.REFERRAL_HASH_SECRET;
  if (!secret) {
    throw new Error("REFERRAL_HASH_SECRET is not configured");
  }
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

/**
 * Best-effort extraction of the visitor's IP from a request, accounting for
 * the headers Netlify / common proxies attach.
 */
export function getClientIp(headers: Headers): string {
  const candidates = [
    headers.get("x-nf-client-connection-ip"),
    headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
  ].filter(Boolean) as string[];

  return candidates[0] ?? "0.0.0.0";
}

export function isValidReferralCodeFormat(code: string): boolean {
  return /^[A-Za-z0-9_-]{2,32}$/.test(code);
}

/** True when `err` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

export type ReferralTrackResult =
  | { status: "invalid" }
  | { status: "disabled" }
  | { status: "counted"; workerId: string }
  | { status: "duplicate"; workerId: string };

/**
 * Validate a referral code and record a click server-side. Relies on the
 * database's UNIQUE(worker_id, ip_hash) constraint to safely deduplicate
 * concurrent requests from the same IP — the insert either succeeds (first
 * time) or fails with a unique-violation (already counted), and both
 * outcomes are handled without a race condition.
 */
export async function trackReferralClick(params: {
  referralCode: string;
  ip: string;
  landingPage: string;
  deviceType?: string;
  visitorId?: string;
}): Promise<ReferralTrackResult> {
  const { referralCode, ip, landingPage, deviceType, visitorId } = params;

  if (!isValidReferralCodeFormat(referralCode)) {
    return { status: "invalid" };
  }

  const worker = await prisma.worker.findUnique({
    where: { referralCode },
    select: { id: true, status: true },
  });

  if (!worker) return { status: "invalid" };
  if (worker.status !== "ACTIVE") return { status: "disabled" };

  const ipHash = hashIp(ip);

  try {
    await prisma.referralClick.create({
      data: {
        workerId: worker.id,
        referralCode,
        ipHash,
        landingPage,
        deviceType,
        visitorId,
        source: "referral_link",
      },
    });
    return { status: "counted", workerId: worker.id };
  } catch (err: unknown) {
    // P2002 = unique constraint violation -> this IP was already counted
    // for this worker. This is the expected, common case, not an error.
    if (isUniqueConstraintError(err)) {
      return { status: "duplicate", workerId: worker.id };
    }
    throw err;
  }
}

export type WhatsappTrackResult =
  | { status: "recorded"; conversionId: string }
  | { status: "duplicate" };

/**
 * Record a WhatsApp Click event, applying the same one-per-IP-per-worker
 * rule as referral clicks (via the database's UNIQUE(worker_id, ip_hash)
 * constraint on whatsapp_conversions) — this is what worker conversion
 * rates are calculated from, so it needs the same fraud protection as
 * referral clicks. Clicks with no worker attribution (workerId null) are
 * always recorded — Postgres treats NULL as distinct in a unique index, so
 * there's no dedup for them, matching that there's no worker-fraud concern
 * for unattributed traffic.
 */
export async function trackWhatsappClick(params: {
  workerId: string | null;
  referralCode: string | null;
  ip: string;
  page: string;
  visitorId?: string | null;
}): Promise<WhatsappTrackResult> {
  const { workerId, referralCode, ip, page, visitorId } = params;
  const ipHash = hashIp(ip);

  try {
    const conversion = await prisma.whatsappConversion.create({
      data: { workerId, referralCode, ipHash, page, visitorId },
    });
    return { status: "recorded", conversionId: conversion.id };
  } catch (err: unknown) {
    if (workerId && isUniqueConstraintError(err)) {
      return { status: "duplicate" };
    }
    throw err;
  }
}
