import { prisma } from "@/lib/db";

export default async function AdminFarmersPage() {
  const [farmers, workers] = await Promise.all([
    prisma.farmerProfile.findMany({
      include: {
        user: true,
        _count: { select: { calculations: true, notifications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.worker.findMany({ include: { user: true } }),
  ]);

  const workerByCode = new Map(workers.map((w) => [w.referralCode, w.user.name]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-brand-dark">Farmers</h1>
          <p className="mt-1 text-sm text-brand-dark/60">
            Registered farmer accounts. Location shown is the general region
            a farmer saved, not precise GPS coordinates — those are never
            displayed here (section 77).
          </p>
        </div>
        <div className="rounded-xl bg-brand-lighter/60 px-4 py-2 text-sm font-semibold text-brand-dark">
          {farmers.length} registered
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-lighter bg-white p-6">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-lighter text-brand-dark/60">
              <th className="py-2">Name</th>
              <th className="py-2">Contact</th>
              <th className="py-2">Region</th>
              <th className="py-2">Referred By</th>
              <th className="py-2">Active Crop</th>
              <th className="py-2">Saved Calcs</th>
              <th className="py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((f) => (
              <tr key={f.id} className="border-b border-brand-lighter/60 align-top">
                <td className="py-3 font-medium text-brand-dark">{f.user.name}</td>
                <td className="py-3 text-brand-dark/70">{f.user.email ?? f.user.phone ?? "—"}</td>
                <td className="py-3 text-brand-dark/70">{f.defaultRegion ?? "—"}</td>
                <td className="py-3 text-brand-dark/70">
                  {f.referralCode ? (workerByCode.get(f.referralCode) ?? f.referralCode) : "Direct / not referred"}
                </td>
                <td className="py-3 text-brand-dark/70">
                  {f.plantingDate
                    ? `Planted ${f.plantingDate.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}`
                    : "No active crop set"}
                </td>
                <td className="py-3 text-brand-dark/70">{f._count.calculations}</td>
                <td className="py-3 text-brand-dark/60">
                  {f.createdAt.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {farmers.length === 0 && (
          <p className="py-6 text-center text-sm text-brand-dark/50">
            No farmers have registered yet.
          </p>
        )}
      </div>
    </div>
  );
}
