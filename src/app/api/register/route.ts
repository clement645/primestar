import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { REFERRAL_COOKIE_NAME } from "@/lib/constants";

export const runtime = "nodejs";

// Public self-registration is for FARMER accounts only (section 58/76).
// Worker and admin accounts are provisioned by an administrator, never via
// this open endpoint.
const bodySchema = z.object({
  name: z.string().min(2).max(120),
  identifier: z.string().min(3).max(190), // email or phone
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
  const { name, identifier, password } = parsed.data;
  const isEmail = identifier.includes("@");

  const existing = await prisma.user.findFirst({
    where: isEmail ? { email: identifier } : { phone: identifier },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with these details already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Preserve referral attribution at signup time — but never let the
  // browser tell us which worker to credit; only a server-verified cookie
  // (set by our own tracking proxy) is trusted (section 82).
  const referralCode = request.cookies.get(REFERRAL_COOKIE_NAME)?.value ?? null;
  let verifiedReferralCode: string | null = null;
  if (referralCode) {
    const worker = await prisma.worker.findUnique({ where: { referralCode } });
    if (worker && worker.status === "ACTIVE") verifiedReferralCode = referralCode;
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: isEmail ? identifier : undefined,
      phone: isEmail ? undefined : identifier,
      passwordHash,
      role: "FARMER",
      farmerProfile: {
        create: {
          referralCode: verifiedReferralCode,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
