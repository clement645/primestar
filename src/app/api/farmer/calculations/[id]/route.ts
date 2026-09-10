import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentFarmerProfile } from "@/lib/authz";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const farmer = await getCurrentFarmerProfile();
  if (!farmer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const calculation = await prisma.farmerCalculation.findUnique({ where: { id } });

  // A farmer may only delete their own calculations — ownership is
  // verified server-side against the session, never trusted from the client.
  if (!calculation || calculation.farmerId !== farmer.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.farmerCalculation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
