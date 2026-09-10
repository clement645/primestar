"use client";

import { useMemo, useState } from "react";
import { calculateSeedRequirement } from "@/lib/calculators";
import WhatsAppButton from "@/components/WhatsAppButton";

/** Tool A — agronomic estimate from farm size + spacing (section 14, 81). */
export default function SeedRequirementCalculator() {
  const [areaHectares, setAreaHectares] = useState(1);
  const [rowSpacingCm, setRowSpacingCm] = useState(75);
  const [plantSpacingCm, setPlantSpacingCm] = useState(30);
  const [seedTuberWeightG, setSeedTuberWeightG] = useState(50);

  const result = useMemo(
    () =>
      calculateSeedRequirement({
        areaHectares,
        rowSpacingCm,
        plantSpacingCm,
        seedTuberWeightG,
      }),
    [areaHectares, rowSpacingCm, plantSpacingCm, seedTuberWeightG]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-brand-lighter bg-white p-6">
        <div>
          <label className="text-sm font-semibold text-brand-dark">
            Farm size (hectares)
          </label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={areaHectares}
            onChange={(e) => setAreaHectares(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
          />
          <p className="mt-1 text-xs text-brand-dark/50">1 acre ≈ 0.405 hectares</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-brand-dark">
            Row spacing (cm)
          </label>
          <input
            type="number"
            min={1}
            value={rowSpacingCm}
            onChange={(e) => setRowSpacingCm(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-brand-dark">
            Plant spacing (cm)
          </label>
          <input
            type="number"
            min={1}
            value={plantSpacingCm}
            onChange={(e) => setPlantSpacingCm(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-brand-dark">
            Average seed tuber weight (grams) — optional
          </label>
          <input
            type="number"
            min={0}
            value={seedTuberWeightG}
            onChange={(e) => setSeedTuberWeightG(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-brand-lighter/60 p-6">
          <p className="text-sm font-semibold text-brand-dark/70">
            Estimated Planting Positions
          </p>
          <p className="mt-1 font-heading text-3xl font-extrabold text-brand-dark">
            {result.plantingPositions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-brand-lighter/60 p-6">
          <p className="text-sm font-semibold text-brand-dark/70">
            Estimated Plant Population
          </p>
          <p className="mt-1 font-heading text-3xl font-extrabold text-brand-dark">
            {result.plantPopulation.toLocaleString()}
          </p>
        </div>
        {result.estimatedSeedKg !== null && (
          <div className="rounded-2xl bg-brand-lighter/60 p-6">
            <p className="text-sm font-semibold text-brand-dark/70">
              Estimated Seed Requirement
            </p>
            <p className="mt-1 font-heading text-3xl font-extrabold text-brand-dark">
              {result.estimatedSeedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
            </p>
          </div>
        )}
        <p className="rounded-xl bg-brand-amber/10 p-4 text-sm text-brand-earth">
          These figures are agronomic estimates based on the spacing you
          entered. Actual seed requirements can vary with seed size, field
          shape, and planting method.
        </p>
        <WhatsAppButton
          variant="outline"
          className="w-full"
          message="Hello Primestar, I used the Seed Requirement Calculator and would like more information about Shangi potato seeds."
        >
          Get Seed Information
        </WhatsAppButton>
      </div>
    </div>
  );
}
