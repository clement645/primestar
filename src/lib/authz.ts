import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Server-side session + role check helpers. Role and ownership always come
 * from the session (derived from the DB-backed JWT), never from anything
 * the client submits in a request body (sections 35, 76).
 */

export async function requireSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function requireRole(role: "ADMIN" | "WORKER" | "FARMER") {
  const session = await requireSession();
  if (!session) return null;
  if ((session.user as { role?: string }).role !== role) return null;
  return session;
}

export async function getCurrentWorker() {
  const session = await requireRole("WORKER");
  if (!session) return null;
  const userId = (session.user as { id?: string }).id;
  if (!userId) return null;
  return prisma.worker.findUnique({ where: { userId } });
}

export async function getCurrentFarmerProfile() {
  const session = await requireRole("FARMER");
  if (!session) return null;
  const userId = (session.user as { id?: string }).id;
  if (!userId) return null;
  return prisma.farmerProfile.findUnique({ where: { userId } });
}
