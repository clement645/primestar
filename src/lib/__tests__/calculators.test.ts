import { describe, it, expect } from "vitest";
import { calculateSeedAcreage, calculateBudget } from "@/lib/calculators";

// Validates the exact worked example from the spec (section 69) to within
// normal rounding tolerance.
describe("Primestar Seed & Acreage / Budget calculators", () => {
  const assumptions = {
    seedBagsPerAcre: 10,
    seedBagWeightKg: 65,
    otherCostMultiplier: 1.5,
    minimumYieldMultiplier: 8,
    maximumYieldMultiplier: 12,
  };

  it("reproduces the 1-acre worked example", () => {
    const seed = calculateSeedAcreage(1, 2750, assumptions);
    expect(seed.seedBags).toBe(10);
    expect(seed.seedWeightKg).toBe(650);
    expect(seed.seedCost).toBe(27500);

    const budget = calculateBudget(seed.seedBags, seed.seedCost, 2500, assumptions);
    expect(budget.otherCosts).toBe(41250);
    expect(budget.totalInvestment).toBe(68750);
    expect(budget.minimumHarvestBags).toBe(80);
    expect(budget.maximumHarvestBags).toBe(120);
    expect(budget.minimumRevenue).toBe(200000);
    expect(budget.maximumRevenue).toBe(300000);
    expect(budget.minimumProfit).toBe(131250);
    expect(budget.maximumProfit).toBe(231250);
    expect(budget.minimumRoi).toBeCloseTo(190.9, 1);
    expect(budget.maximumRoi).toBeCloseTo(336.4, 1);
  });

  it("handles a zero investment safely without dividing by zero", () => {
    const budget = calculateBudget(0, 0, 2500, assumptions);
    expect(budget.minimumRoi).toBe(0);
    expect(budget.maximumRoi).toBe(0);
    expect(Number.isFinite(budget.minimumRoi)).toBe(true);
  });
});
