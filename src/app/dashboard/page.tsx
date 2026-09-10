import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardRouter() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "WORKER") redirect("/worker/dashboard");
  if (role === "FARMER") redirect("/farmer/dashboard");
  redirect("/");
}
