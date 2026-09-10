import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ReferralShareCard from "@/components/worker/ReferralShareCard";

export default async function WorkerDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "WORKER") {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id!;
  const worker = await prisma.worker.findUnique({ where: { userId } });
  if (!worker) redirect("/login");

  const [clicks, whatsappClicks] = await Promise.all([
    prisma.referralClick.count({ where: { workerId: worker.id } }),
    prisma.whatsappConversion.count({ where: { workerId: worker.id } }),
  ]);

  const conversionRate = clicks > 0 ? (whatsappClicks / clicks) * 100 : 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const referralUrl = `${siteUrl}/?ref=${worker.referralCode}`;

  return (
    <div className="container-page py-10">
      <h1 className="font-heading text-3xl font-extrabold text-brand-dark">
        Welcome, {session.user.name}
      </h1>
      <p className="mt-1 text-brand-dark/60">
        Referral Code: <span className="font-semibold text-brand-dark">{worker.referralCode}</span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Counted Referral Clicks" value={clicks.toLocaleString()} />
        <StatCard label="WhatsApp Clicks" value={whatsappClicks.toLocaleString()} />
        <StatCard label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} />
      </div>

      <div className="mt-8">
        <ReferralShareCard referralUrl={referralUrl} />
      </div>

      <div className="mt-8 rounded-2xl bg-brand-lighter/60 p-6 text-sm text-brand-dark/75">
        <p>
          Share your personal referral link with farmers. When farmers visit
          Primestar through your link, the system attributes the visit to
          you.
        </p>
        <p className="mt-2">
          Repeated visits from the same IP address are not counted as
          additional referral clicks — this keeps the statistics fair and
          accurate.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-lighter bg-white p-6">
      <p className="text-sm font-semibold text-brand-dark/60">{label}</p>
      <p className="mt-1 font-heading text-3xl font-extrabold text-brand-dark">{value}</p>
    </div>
  );
}
