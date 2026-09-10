"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { calculateSeedAcreage, calculateBudget } from "@/lib/calculators";
import WhatsAppButton from "@/components/WhatsAppButton";

function formatKsh(n: number) {
  return `KSh ${Math.round(n).toLocaleString("en-KE")}`;
}

export interface CalculatorSettingsShape {
  seedBagsPerAcre: number;
  seedBagWeightKg: number;
  defaultSeedPrice: number;
  minimumSellingPrice: number;
  maximumSellingPrice: number;
  otherCostMultiplier: number;
  minimumYieldMultiplier: number;
  maximumYieldMultiplier: number;
  disclaimer: string;
}

/** Tools B & C — Primestar Seed & Acreage Calculator + Farm Budget & ROI Analyzer. */
export default function PlanningCalculator({
  settings,
}: {
  settings: CalculatorSettingsShape;
}) {
  const { data: session } = useSession();
  const [acres, setAcres] = useState(1);
  const [seedPrice, setSeedPrice] = useState(settings.defaultSeedPrice);
  const [sellingPrice, setSellingPrice] = useState(
    Math.round((settings.minimumSellingPrice + settings.maximumSellingPrice) / 2)
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const seed = useMemo(
    () => calculateSeedAcreage(acres, seedPrice, settings),
    [acres, seedPrice, settings]
  );

  const budget = useMemo(
    () => calculateBudget(seed.seedBags, seed.seedCost, sellingPrice, settings),
    [seed, sellingPrice, settings]
  );

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/farmer/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acres,
          seedPrice,
          sellingPrice,
          seed,
          budget,
        }),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-brand-lighter bg-white p-6 print:hidden">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-brand-dark">Farm size (acres)</label>
              <span className="font-heading text-lg font-bold text-brand-dark">{acres}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="mt-2 w-full accent-brand-medium"
            />
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value) || 0)}
              className="mt-2 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
              aria-label="Farm size in acres (manual entry)"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-brand-dark">
              Seed price per bag (KSh)
            </label>
            <input
              type="number"
              min={0}
              value={seedPrice}
              onChange={(e) => setSeedPrice(Number(e.target.value) || 0)}
              className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
            />
            <p className="mt-1 text-xs text-brand-dark/50">
              Default estimate: {formatKsh(settings.defaultSeedPrice)} per bag
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-brand-dark">
                Selling price per harvest bag (KSh)
              </label>
              <span className="font-heading text-lg font-bold text-brand-dark">
                {formatKsh(sellingPrice)}
              </span>
            </div>
            <input
              type="range"
              min={settings.minimumSellingPrice}
              max={settings.maximumSellingPrice}
              step={50}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="mt-2 w-full accent-brand-medium"
            />
            <div className="mt-1 flex justify-between text-xs text-brand-dark/50">
              <span>{formatKsh(settings.minimumSellingPrice)}</span>
              <span>{formatKsh(settings.maximumSellingPrice)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <ResultCard label="Required Seed Bags" value={seed.seedBags.toLocaleString()} />
          <ResultCard
            label="Total Seed Weight"
            value={`${seed.seedWeightKg.toLocaleString()} kg`}
          />
          <ResultCard label="Seed Investment" value={formatKsh(seed.seedCost)} />
          <ResultCard label="Estimated Other Costs" value={formatKsh(budget.otherCosts)} />
          <ResultCard
            label="Total Estimated Investment"
            value={formatKsh(budget.totalInvestment)}
            highlight
          />
          <ResultCard
            label="Estimated Harvest Range"
            value={`${budget.minimumHarvestBags.toLocaleString()} – ${budget.maximumHarvestBags.toLocaleString()} bags`}
          />
          <ResultCard
            label="Estimated Revenue Range"
            value={`${formatKsh(budget.minimumRevenue)} – ${formatKsh(budget.maximumRevenue)}`}
          />
          <ResultCard
            label="Estimated Net Profit Range"
            value={`${formatKsh(budget.minimumProfit)} – ${formatKsh(budget.maximumProfit)}`}
            highlight
          />
          <ResultCard
            label="Estimated ROI Range"
            value={`${budget.minimumRoi.toFixed(1)}% – ${budget.maximumRoi.toFixed(1)}%`}
            highlight
          />
        </div>
      </div>

      <p className="mt-6 rounded-xl bg-brand-amber/10 p-4 text-sm text-brand-earth print:mt-4">
        {settings.disclaimer}
      </p>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border-2 border-brand-dark px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-dark hover:text-white"
        >
          Print Report
        </button>
        {session?.user && (session.user as { role?: string }).role === "FARMER" ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="rounded-full bg-brand-medium px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saveState === "saved"
              ? "Saved ✓"
              : saveState === "saving"
              ? "Saving..."
              : "Save Calculation"}
          </button>
        ) : (
          <a
            href="/register"
            className="rounded-full bg-brand-medium px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Create a free account to save this
          </a>
        )}
        <WhatsAppButton
          variant="outline"
          message={`Hello Primestar, I used the Farm Budget Calculator for ${acres} acres and would like to discuss Shangi potato seeds.`}
        >
          Discuss With Primestar
        </WhatsAppButton>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        highlight ? "bg-brand-dark text-white" : "bg-brand-lighter/60 text-brand-dark"
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-brand-cream/80" : "text-brand-dark/70"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl font-extrabold">{value}</p>
    </div>
  );
}
