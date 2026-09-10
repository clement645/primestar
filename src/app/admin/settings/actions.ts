"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/authz";

const siteSettingsSchema = z.object({
  businessName: z.string().min(2).max(160),
  businessDescription: z.string().max(500),
  whatsappNumber: z.string().min(9).max(20),
  facebookUrl: z.string().url(),
  tiktokUrl: z.string().url(),
  contactEmail: z.string().email().or(z.literal("")),
  physicalAddress: z.string().max(300).optional(),
  openingHours: z.string().max(300).optional(),
  referralAttributionDays: z.coerce.number().int().min(1).max(365),
  seoDefaultTitle: z.string().max(160),
  seoDefaultDescription: z.string().max(300),
});

export async function updateSiteSettings(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the form fields." };

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}

const calculatorSchema = z.object({
  seedBagsPerAcre: z.coerce.number().positive(),
  seedBagWeightKg: z.coerce.number().positive(),
  defaultSeedPrice: z.coerce.number().nonnegative(),
  minimumSellingPrice: z.coerce.number().nonnegative(),
  maximumSellingPrice: z.coerce.number().positive(),
  otherCostMultiplier: z.coerce.number().nonnegative(),
  minimumYieldMultiplier: z.coerce.number().positive(),
  maximumYieldMultiplier: z.coerce.number().positive(),
  disclaimer: z.string().max(500),
});

export async function updateCalculatorSettings(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const parsed = calculatorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the form fields." };
  if (parsed.data.minimumSellingPrice >= parsed.data.maximumSellingPrice) {
    return { error: "Minimum selling price must be less than maximum selling price." };
  }

  await prisma.calculatorSettings.upsert({
    where: { id: 1 },
    update: { ...parsed.data, updatedBy: session.user?.name ?? "admin" },
    create: { id: 1, ...parsed.data, updatedBy: session.user?.name ?? "admin" },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/calculator");
  return { ok: true };
}

const weatherSchema = z.object({
  lateBlightHumidityPct: z.coerce.number().min(0).max(100),
  lateBlightMinTempC: z.coerce.number(),
  lateBlightMaxTempC: z.coerce.number(),
  plantingMinSoilTempC: z.coerce.number(),
  frostTempC: z.coerce.number(),
});

export async function updateWeatherThresholds(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const parsed = weatherSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the form fields." };

  await prisma.weatherAlertRuleConfig.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}

const announcementSchema = z.object({
  title: z.string().min(2).max(160),
  message: z.string().min(2).max(1000),
  severity: z.enum(["RED", "AMBER", "INFO"]),
});

export async function createAnnouncement(formData: FormData): Promise<{ error?: string }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the form fields." };

  await prisma.adminAnnouncement.create({
    data: { ...parsed.data, createdBy: session.user?.name ?? "admin" },
  });

  revalidatePath("/admin/settings");
  return {};
}

export async function toggleAnnouncement(id: string): Promise<void> {
  const session = await requireRole("ADMIN");
  if (!session) return;

  const announcement = await prisma.adminAnnouncement.findUnique({ where: { id } });
  if (!announcement) return;

  await prisma.adminAnnouncement.update({
    where: { id },
    data: { status: announcement.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });

  revalidatePath("/admin/settings");
}
