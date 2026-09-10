"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Calculation {
  id: string;
  acres: number;
  totalInvestment: number;
  minimumProfit: number;
  maximumProfit: number;
  minimumRoi: number;
  maximumRoi: number;
  createdAt: string;
}

function formatKsh(n: number) {
  return `KSh ${Math.round(n).toLocaleString("en-KE")}`;
}

export default function CalculationHistory({ calculations }: { calculations: Calculation[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this saved calculation?")) return;
    setDeletingId(id);
    await fetch(`/api/farmer/calculations/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  if (calculations.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-lighter bg-white p-6 text-sm text-brand-dark/60">
        No saved calculations yet. Use the Farming Calculator and click &quot;Save Calculation&quot; to keep a record here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {calculations.map((calc) => (
        <div
          key={calc.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-lighter bg-white p-5"
        >
          <div>
            <p className="font-semibold text-brand-dark">
              {calc.acres} acre{calc.acres === 1 ? "" : "s"} — {formatKsh(calc.totalInvestment)} investment
            </p>
            <p className="mt-1 text-sm text-brand-dark/60">
              Profit: {formatKsh(calc.minimumProfit)}–{formatKsh(calc.maximumProfit)} · ROI:{" "}
              {calc.minimumRoi.toFixed(1)}%–{calc.maximumRoi.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-brand-dark/40">
              Saved {new Date(calc.createdAt).toLocaleDateString("en-KE")}
            </p>
          </div>
          <button
            type="button"
            disabled={deletingId === calc.id}
            onClick={() => handleDelete(calc.id)}
            className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
