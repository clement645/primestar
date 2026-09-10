"use client";

import { useState } from "react";
import SeedRequirementCalculator from "@/components/calculator/SeedRequirementCalculator";
import PlanningCalculator, {
  type CalculatorSettingsShape,
} from "@/components/calculator/PlanningCalculator";

const TABS = [
  { key: "requirement", label: "Seed Requirement (Agronomic)" },
  { key: "planning", label: "Seed, Acreage & Farm Budget" },
] as const;

export default function CalculatorTabs({
  settings,
}: {
  settings: CalculatorSettingsShape;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("planning");

  return (
    <div>
      <div className="mx-auto flex max-w-xl gap-2 rounded-full bg-brand-lighter/60 p-1.5 print:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-white text-brand-dark shadow-sm" : "text-brand-dark/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-brand-dark/60 print:hidden">
        {tab === "requirement"
          ? "An agronomic estimate based on your farm size and chosen spacing."
          : "A business planning tool based on Primestar's configured seed and cost assumptions."}
      </p>

      <div className="mt-8">
        {tab === "requirement" ? (
          <SeedRequirementCalculator />
        ) : (
          <PlanningCalculator settings={settings} />
        )}
      </div>
    </div>
  );
}
