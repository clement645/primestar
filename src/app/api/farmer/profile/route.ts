import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentFarmerProfile } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET() {
  const farmer = await getCurrentFarmerProfile();
  if (!farmer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ profile: farmer });
}

const updateSchema = z.object({
  defaultRegion: z.string().max(120).optional(),
  defaultPostalCode: z.string().max(20).optional(),
  plantingDate: z.string().datetime().optional().nullable(),
  notifyWeather: z.boolean().optional(),
  notifyCropStage: z.boolean().optional(),
  notifyAdmin: z.boolean().optional(),
  // Only present when the farmer explicitly opts to save a precise
  // location (section 77) — never written silently from a GPS lookup.
  saveLocation: z
    .object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })
    .optional(),
});

export async function PUT(request: NextRequest) {
  const farmer = await getCurrentFarmerProfile();
  if (!farmer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const data = parsed.data;

  const updated = await prisma.farmerProfile.update({
    where: { id: farmer.id },
    data: {
      defaultRegion: data.defaultRegion,
      defaultPostalCode: data.defaultPostalCode,
      plantingDate: data.plantingDate === undefined ? undefined : data.plantingDate ? new Date(data.plantingDate) : null,
      notifyWeather: data.notifyWeather,
      notifyCropStage: data.notifyCropStage,
      notifyAdmin: data.notifyAdmin,
      ...(data.saveLocation
        ? { defaultLatitude: data.saveLocation.latitude, defaultLongitude: data.saveLocation.longitude }
        : {}),
    },
  });

  return NextResponse.json({ profile: updated });
}
