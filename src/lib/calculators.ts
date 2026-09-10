// Pure calculator functions — no DB/UI dependencies so they're trivially
// unit-testable and shared between server (save) and client (live preview).

export interface SeedRequirementInput {
  areaHectares: number;
  rowSpacingCm: number;
  plantSpacingCm: number;
  seedTuberWeightG?: number; // average weight per seed tuber, for kg estimate
}

export interface SeedRequirementResult {
  plantPopulation: number;
  plantingPositions: number;
  estimatedSeedKg: number | null;
}

/** Tool A — agronomic seed requirement estimate from spacing. */
export function calculateSeedRequirement(
  input: SeedRequirementInput
): SeedRequirementResult {
  const { areaHectares, rowSpacingCm, plantSpacingCm, seedTuberWeightG } = input;
  const areaM2 = areaHectares * 10000;
  const spacingM2 = (rowSpacingCm / 100) * (plantSpacingCm / 100);
  const plantPopulation = spacingM2 > 0 ? Math.floor(areaM2 / spacingM2) : 0;

  const estimatedSeedKg =
    seedTuberWeightG && seedTuberWeightG > 0
      ? (plantPopulation * seedTuberWeightG) / 1000
      : null;

  return {
    plantPopulation,
    plantingPositions: plantPopulation,
    estimatedSeedKg,
  };
}

export interface CalculatorAssumptions {
  seedBagsPerAcre: number;
  seedBagWeightKg: number;
  defaultSeedPrice: number;
  minimumSellingPrice: number;
  maximumSellingPrice: number;
  otherCostMultiplier: number;
  minimumYieldMultiplier: number;
  maximumYieldMultiplier: number;
}

export interface SeedAcreageResult {
  acres: number;
  seedBags: number;
  seedWeightKg: number;
  seedCost: number;
}

/** Tool B — Primestar Seed & Acreage Calculator. */
export function calculateSeedAcreage(
  acres: number,
  seedPrice: number,
  assumptions: Pick<CalculatorAssumptions, "seedBagsPerAcre" | "seedBagWeightKg">
): SeedAcreageResult {
  const seedBags = acres * assumptions.seedBagsPerAcre;
  const seedWeightKg = seedBags * assumptions.seedBagWeightKg;
  const seedCost = seedBags * seedPrice;
  return { acres, seedBags, seedWeightKg, seedCost };
}

export interface BudgetResult {
  otherCosts: number;
  totalInvestment: number;
  minimumHarvestBags: number;
  maximumHarvestBags: number;
  minimumRevenue: number;
  maximumRevenue: number;
  minimumProfit: number;
  maximumProfit: number;
  minimumRoi: number;
  maximumRoi: number;
}

/** Tool C — Farm Budget & ROI Analyzer. */
export function calculateBudget(
  seedBags: number,
  seedCost: number,
  sellingPrice: number,
  assumptions: Pick<
    CalculatorAssumptions,
    "otherCostMultiplier" | "minimumYieldMultiplier" | "maximumYieldMultiplier"
  >
): BudgetResult {
  const otherCosts = seedCost * assumptions.otherCostMultiplier;
  const totalInvestment = seedCost + otherCosts;

  const minimumHarvestBags = seedBags * assumptions.minimumYieldMultiplier;
  const maximumHarvestBags = seedBags * assumptions.maximumYieldMultiplier;

  const minimumRevenue = minimumHarvestBags * sellingPrice;
  const maximumRevenue = maximumHarvestBags * sellingPrice;

  const minimumProfit = minimumRevenue - totalInvestment;
  const maximumProfit = maximumRevenue - totalInvestment;

  const safeInvestment = totalInvestment > 0 ? totalInvestment : null;
  const minimumRoi = safeInvestment ? (minimumProfit / safeInvestment) * 100 : 0;
  const maximumRoi = safeInvestment ? (maximumProfit / safeInvestment) * 100 : 0;

  return {
    otherCosts,
    totalInvestment,
    minimumHarvestBags,
    maximumHarvestBags,
    minimumRevenue,
    maximumRevenue,
    minimumProfit,
    maximumProfit,
    minimumRoi,
    maximumRoi,
  };
}
