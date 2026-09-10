import { prisma } from "@/lib/db";
import CreateWorkerForm from "@/components/admin/CreateWorkerForm";
import WorkerRowActions from "@/components/admin/WorkerRowActions";

export default async function AdminWorkersPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const workers = await prisma.worker.findMany({
    include: { user: true, _count: { select: { referralClicks: true, whatsappConversions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-brand-dark">Workers</h1>
      <p className="mt-1 text-sm text-brand-dark/60">
        Add workers, manage their status, and copy their referral links.
      </p>

      <div className="mt-6 rounded-2xl border border-brand-lighter bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">Add a Worker</h2>
        <div className="mt-4">
          <CreateWorkerForm />
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-brand-lighter bg-white p-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-lighter text-brand-dark/60">
              <th className="py-2">Name</th>
              <th className="py-2">Referral Code</th>
              <th className="py-2">Status</th>
              <th className="py-2">Clicks</th>
              <th className="py-2">WhatsApp Clicks</th>
              <th className="py-2">Conv. Rate</th>
              <th className="py-2">Created</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => {
              const rate =
                w._count.referralClicks > 0
                  ? (w._count.whatsappConversions / w._count.referralClicks) * 100
                  : 0;
              return (
                <tr key={w.id} className="border-b border-brand-lighter/60 align-top">
                  <td className="py-3 font-medium text-brand-dark">
                    {w.user.name}
                    <div className="text-xs font-normal text-brand-dark/50">{w.user.email}</div>
                  </td>
                  <td className="py-3">{w.referralCode}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        w.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3">{w._count.referralClicks.toLocaleString()}</td>
                  <td className="py-3">{w._count.whatsappConversions.toLocaleString()}</td>
                  <td className="py-3">{rate.toFixed(1)}%</td>
                  <td className="py-3 text-brand-dark/60">
                    {w.createdAt.toLocaleDateString("en-KE")}
                  </td>
                  <td className="py-3">
                    <WorkerRowActions
                      workerId={w.id}
                      status={w.status}
                      referralUrl={`${siteUrl}/?ref=${w.referralCode}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
