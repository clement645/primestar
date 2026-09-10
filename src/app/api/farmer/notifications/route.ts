import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentFarmerProfile } from "@/lib/authz";
import { syncFarmerNotifications } from "@/lib/notifications";

export const runtime = "nodejs";

export async function GET() {
  const farmer = await getCurrentFarmerProfile();
  if (!farmer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await syncFarmerNotifications(farmer.id);

  const [notifications, unreadCount] = await Promise.all([
    prisma.farmerNotification.findMany({
      where: { farmerId: farmer.id, dismissedAt: null },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    }),
    prisma.farmerNotification.count({
      where: { farmerId: farmer.id, readAt: null, dismissedAt: null },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

const actionSchema = z.object({
  action: z.enum(["markRead", "markAllRead", "dismiss"]),
  id: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  const farmer = await getCurrentFarmerProfile();
  if (!farmer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { action, id } = parsed.data;

  if (action === "markAllRead") {
    await prisma.farmerNotification.updateMany({
      where: { farmerId: farmer.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Ownership is always re-checked server-side — a farmer can only touch
  // their own notification rows regardless of what id the client sends.
  const notification = await prisma.farmerNotification.findUnique({ where: { id } });
  if (!notification || notification.farmerId !== farmer.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "markRead") {
    await prisma.farmerNotification.update({ where: { id }, data: { readAt: new Date() } });
  } else if (action === "dismiss") {
    await prisma.farmerNotification.update({ where: { id }, data: { dismissedAt: new Date() } });
  }

  return NextResponse.json({ ok: true });
}
