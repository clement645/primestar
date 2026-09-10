import type { Metadata } from "next";
import { getCalculatorSettings } from "@/lib/settings";
import CalculatorTabs from "@/components/calculator/CalculatorTabs";

export const metadata: Metadata = {
  title: "Potato Farming Calculator",
  description:
    "Estimate potato seed requirements, planting positions, and farm budget/ROI for your Shangi potato farm in Kenya.",
};

export const revalidate = 60;

export default async function CalculatorPage() {
  const settings = await getCalculatorSettings();

  return (
    <div className="container-page py-14">
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-medium">
          Plan Your Farm
        </span>
        <h1 className="mt-2 font-heading text-4xl font-extrabold text-brand-dark">
          Potato Farming Calculator
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-brand-dark/75">
          Use these tools to estimate seed requirements and plan your farm
          budget. Results are estimates — actual costs, yields and prices may
          differ.
        </p>
      </div>

      <div className="mt-10">
        <CalculatorTabs settings={settings} />
      </div>
    </div>
  );
}
