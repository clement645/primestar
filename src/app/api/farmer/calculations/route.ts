import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentFarmerProfile } from "@/lib/authz";

export const runtime = "nodejs";

const bodySchema = z.object({
  acres: z.number().positive(),
  seedPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  seed: z.object({
    seedBags: z.number(),
    seedWeightKg: z.number(),
    seedCost: z.number(),
  }),
  budget: z.object({
    otherCosts: z.number(),
    totalInvestment: z.number(),
    minimumHarvestBags: z.number(),
    maximumHarvestBags: z.number(),
    minimumRevenue: z.number(),
    maximumRevenue: z.number(),
    minimumProfit: z.number(),
    maximumProfit: z.number(),
    minimumRoi: z.number(),
    maximumRoi: z.number(),
  }),
});

export async function GET() {
  const farmer = await getCurrentFarmerProfile();
  if (!farmer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const calculations = await prisma.farmerCalculation.findMany({
    where: { farmerId: farmer.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ calculations });
}

export async function POST(request: NextRequest) {
  const farmer = await getCurrentFarmerProfile();
  if (!farmer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { acres, seedPrice, sellingPrice, seed, budget } = parsed.data;

  const calculation = await prisma.farmerCalculation.create({
    data: {
      farmerId: farmer.id,
      acres,
      seedBags: seed.seedBags,
      seedWeightKg: seed.seedWeightKg,
      seedPrice,
      seedCost: seed.seedCost,
      otherCosts: budget.otherCosts,
      totalInvestment: budget.totalInvestment,
      minimumYieldBags: budget.minimumHarvestBags,
      maximumYieldBags: budget.maximumHarvestBags,
      sellingPrice,
      minimumRevenue: budget.minimumRevenue,
      maximumRevenue: budget.maximumRevenue,
      minimumProfit: budget.minimumProfit,
      maximumProfit: budget.maximumProfit,
      minimumRoi: budget.minimumRoi,
      maximumRoi: budget.maximumRoi,
    },
  });

  return NextResponse.json({ calculation }, { status: 201 });
}
