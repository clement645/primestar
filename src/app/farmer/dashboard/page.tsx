import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { geocodeRegion } from "@/lib/geocode";
import { buildCropTimeline } from "@/lib/cropStage";
import WeatherWidget from "@/components/farmer/WeatherWidget";
import NotificationBell from "@/components/farmer/NotificationBell";
import ProfileSettingsForm from "@/components/farmer/ProfileSettingsForm";
import CalculationHistory from "@/components/farmer/CalculationHistory";
import CropTimeline from "@/components/farmer/CropTimeline";

export default async function FarmerDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "FARMER") {
    redirect("/login?callbackUrl=/farmer/dashboard");
  }

  const userId = (session.user as { id?: string }).id!;
  const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
  if (!farmer) redirect("/login");

  const calculations = await prisma.farmerCalculation.findMany({
    where: { farmerId: farmer.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  let lat = farmer.defaultLatitude;
  let lon = farmer.defaultLongitude;
  let locationLabel = farmer.defaultRegion;

  if ((lat == null || lon == null) && farmer.defaultRegion) {
    const geocoded = await geocodeRegion(farmer.defaultRegion);
    if (geocoded) {
      lat = geocoded.latitude;
      lon = geocoded.longitude;
      locationLabel = farmer.defaultRegion;
    }
  }

  const cropTimeline = farmer.plantingDate
    ? buildCropTimeline(
        farmer.plantingDate,
        await prisma.cropStageRule.findMany({ where: { status: "ACTIVE" } })
      )
    : null;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-brand-dark">
            Welcome, {session.user.name}
          </h1>
          <p className="mt-1 text-brand-dark/60">Your personal farming dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-brand-lighter px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-lighter/60"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <WeatherWidget initialLat={lat} initialLon={lon} locationLabel={locationLabel} />
        <ProfileSettingsForm
          defaultRegion={farmer.defaultRegion ?? ""}
          defaultPostalCode={farmer.defaultPostalCode ?? ""}
          plantingDate={farmer.plantingDate ? farmer.plantingDate.toISOString().slice(0, 10) : ""}
        />
      </div>

      {cropTimeline && (
        <div className="mt-8">
          <CropTimeline timeline={cropTimeline} />
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-brand-lighter/60 p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">Plan Your Farm</h2>
        <p className="mt-1 text-sm text-brand-dark/70">
          Use the Seed &amp; Acreage and Farm Budget calculators, then save results here.
        </p>
        <Link
          href="/calculator"
          className="mt-4 inline-block rounded-full bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium"
        >
          Open Farming Calculator
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-brand-dark">Saved Calculations</h2>
        <div className="mt-4">
          <CalculationHistory
            calculations={calculations.map((c) => ({
              id: c.id,
              acres: c.acres,
              totalInvestment: c.totalInvestment,
              minimumProfit: c.minimumProfit,
              maximumProfit: c.maximumProfit,
              minimumRoi: c.minimumRoi,
              maximumRoi: c.maximumRoi,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
