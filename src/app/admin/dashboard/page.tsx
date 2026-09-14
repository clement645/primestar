import Link from "next/link";
import { prisma } from "@/lib/db";
import { resolveDateRange, type DateRangeKey } from "@/lib/dateRanges";
import {
  TrendChart,
  WorkerPerformanceChart,
} from "@/components/admin/AdminCharts";

const RANGE_LABELS: Record<DateRangeKey, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  month: "This Month",
  custom: "Custom Range",
};

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: DateRangeKey; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const range = sp.range ?? "7d";
  const { from, to } = resolveDateRange(range, sp.from, sp.to);

  const [
    totalClicks,
    totalWhatsapp,
    activeWorkers,
    registeredFarmers,
    workers,
    clicksInRange,
    whatsappInRange,
  ] = await Promise.all([
    prisma.referralClick.count(),
    prisma.whatsappConversion.count(),
    prisma.worker.count({ where: { status: "ACTIVE" } }),
    prisma.farmerProfile.count(),
    prisma.worker.findMany({
      include: {
        user: true,
        _count: { select: { referralClicks: true, whatsappConversions: true } },
      },
    }),
    prisma.referralClick.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    }),
    prisma.whatsappConversion.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    }),
  ]);

  const conversionRate =
    totalClicks > 0 ? (totalWhatsapp / totalClicks) * 100 : 0;

  // Build a day-by-day series for the selected range.
  const dayMap = new Map<string, { clicks: number; whatsapp: number }>();
  const cursor = new Date(from);
  while (cursor <= to) {
    const key = cursor.toISOString().slice(0, 10);
    dayMap.set(key, { clicks: 0, whatsapp: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  for (const c of clicksInRange) {
    const key = c.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    if (entry) entry.clicks += 1;
  }
  for (const w of whatsappInRange) {
    const key = w.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    if (entry) entry.whatsapp += 1;
  }
  const trend = Array.from(dayMap.entries()).map(([date, v]) => ({
    date: date.slice(5),
    ...v,
  }));

  const workerPerf = workers
    .map((w) => ({
      id: w.id,
      name: w.user.name,
      code: w.referralCode,
      status: w.status,
      clicks: w._count.referralClicks,
      whatsapp: w._count.whatsappConversions,
      rate:
        w._count.referralClicks > 0
          ? (w._count.whatsappConversions / w._count.referralClicks) * 100
          : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-extrabold text-brand-dark">
          Overview
        </h1>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(RANGE_LABELS) as DateRangeKey[])
            .filter((k) => k !== "custom")
            .map((key) => (
              <Link
                key={key}
                href={`/admin/dashboard?range=${key}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  range === key
                    ? "bg-brand-dark text-white"
                    : "bg-brand-lighter text-brand-dark"
                }`}
              >
                {RANGE_LABELS[key]}
              </Link>
            ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat
          label="Total Counted Referral Clicks"
          value={totalClicks.toLocaleString()}
        />
        <Stat
          label="Total WhatsApp Clicks"
          value={totalWhatsapp.toLocaleString()}
        />
        <Stat
          label="Overall Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
        />
        <Stat label="Active Workers" value={activeWorkers.toLocaleString()} />
        <Stat
          label="Registered Farmers"
          value={registeredFarmers.toLocaleString()}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-brand-lighter bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">
          Referral Clicks & WhatsApp Conversions — {RANGE_LABELS[range]}
        </h2>
        <div className="mt-4">
          <TrendChart data={trend} />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-brand-lighter bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">
          Employee Performance
        </h2>
        <div className="mt-4">
          <WorkerPerformanceChart
            data={workerPerf
              .slice(0, 8)
              .map((w) => ({
                name: w.code,
                clicks: w.clicks,
                whatsapp: w.whatsapp,
              }))}
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-lighter text-brand-dark/60">
                <th className="py-2">Employee</th>
                <th className="py-2">Referral Code</th>
                <th className="py-2">Status</th>
                <th className="py-2">Clicks</th>
                <th className="py-2">WhatsApp Clicks</th>
                <th className="py-2">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {workerPerf.map((w) => (
                <tr key={w.id} className="border-b border-brand-lighter/60">
                  <td className="py-2.5 font-medium text-brand-dark">
                    {w.name}
                  </td>
                  <td className="py-2.5 text-brand-dark/70">{w.code}</td>
                  <td className="py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        w.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2.5">{w.clicks.toLocaleString()}</td>
                  <td className="py-2.5">{w.whatsapp.toLocaleString()}</td>
                  <td className="py-2.5">{w.rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-lighter bg-white p-5">
      <p className="text-sm font-semibold text-brand-dark/60">{label}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold text-brand-dark">
        {value}
      </p>
    </div>
  );
}
