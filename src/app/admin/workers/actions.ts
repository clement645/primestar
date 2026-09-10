"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/authz";
import { isValidReferralCodeFormat } from "@/lib/referral";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  referralCode: z.string().min(2).max(32),
});

export async function createWorker(formData: FormData): Promise<{ error?: string }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    referralCode: formData.get("referralCode"),
  });
  if (!parsed.success) return { error: "Please check the form fields." };

  const { name, email, referralCode } = parsed.data;
  if (!isValidReferralCodeFormat(referralCode)) {
    return { error: "Referral code may only contain letters, numbers, - and _." };
  }

  const existingCode = await prisma.worker.findUnique({ where: { referralCode } });
  if (existingCode) return { error: "That referral code is already in use." };

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { error: "A user with that email already exists." };

  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "WORKER",
      worker: { create: { referralCode } },
    },
  });

  revalidatePath("/admin/workers");
  return {};
}

export async function toggleWorkerStatus(workerId: string): Promise<void> {
  const session = await requireRole("ADMIN");
  if (!session) return;

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return;

  await prisma.worker.update({
    where: { id: workerId },
    data: { status: worker.status === "ACTIVE" ? "DISABLED" : "ACTIVE" },
  });

  revalidatePath("/admin/workers");
}

export async function resetWorkerAccess(workerId: string): Promise<{ tempPassword?: string; error?: string }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return { error: "Worker not found" };

  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.user.update({ where: { id: worker.userId }, data: { passwordHash } });

  revalidatePath("/admin/workers");
  return { tempPassword };
}
