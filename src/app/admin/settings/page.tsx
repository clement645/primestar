import { getSiteSettings, getCalculatorSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";
import AnnouncementToggle from "@/components/admin/AnnouncementToggle";
import {
  updateSiteSettings,
  updateCalculatorSettings,
  updateWeatherThresholds,
  createAnnouncement,
} from "@/app/admin/settings/actions";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none";
const labelClass = "text-sm font-semibold text-brand-dark";

export default async function AdminSettingsPage() {
  const [site, calc, weather, announcements] = await Promise.all([
    getSiteSettings(),
    getCalculatorSettings(),
    prisma.weatherAlertRuleConfig.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.adminAnnouncement.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-extrabold text-brand-dark">Settings</h1>

      <section className="rounded-2xl border border-brand-lighter bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">Business Details</h2>
        <p className="mt-1 text-sm text-brand-dark/60">
          These values are used across the website (contact page, footer, SEO).
        </p>
        <div className="mt-4">
          <SettingsForm action={updateSiteSettings}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Business Name</label>
                <input name="businessName" defaultValue={site.businessName} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number (international format)</label>
                <input name="whatsappNumber" defaultValue={site.whatsappNumber} required className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Business Description</label>
                <textarea
                  name="businessDescription"
                  defaultValue={site.businessDescription}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Facebook URL</label>
                <input name="facebookUrl" defaultValue={site.facebookUrl} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>TikTok URL</label>
                <input name="tiktokUrl" defaultValue={site.tiktokUrl} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact Email (optional)</label>
                <input name="contactEmail" defaultValue={site.contactEmail ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Referral Attribution Window (days)</label>
                <input
                  type="number"
                  name="referralAttributionDays"
                  defaultValue={site.referralAttributionDays}
                  min={1}
                  max={365}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Physical Address (optional)</label>
                <input name="physicalAddress" defaultValue={site.physicalAddress ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Opening Hours (optional)</label>
                <input name="openingHours" defaultValue={site.openingHours ?? ""} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>SEO Default Title</label>
                <input name="seoDefaultTitle" defaultValue={site.seoDefaultTitle} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>SEO Default Description</label>
                <textarea name="seoDefaultDescription" defaultValue={site.seoDefaultDescription} rows={2} className={inputClass} />
              </div>
            </div>
          </SettingsForm>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-lighter bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">Calculator Assumptions</h2>
        <p className="mt-1 text-sm text-brand-dark/60">
          Business planning assumptions used by the Seed &amp; Acreage and Farm Budget calculators.
        </p>
        <div className="mt-4">
          <SettingsForm action={updateCalculatorSettings}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Seed Bags per Acre" name="seedBagsPerAcre" defaultValue={calc.seedBagsPerAcre} />
              <Field label="Seed Bag Weight (kg)" name="seedBagWeightKg" defaultValue={calc.seedBagWeightKg} />
              <Field label="Default Seed Price (KSh)" name="defaultSeedPrice" defaultValue={calc.defaultSeedPrice} />
              <Field label="Minimum Selling Price (KSh)" name="minimumSellingPrice" defaultValue={calc.minimumSellingPrice} />
              <Field label="Maximum Selling Price (KSh)" name="maximumSellingPrice" defaultValue={calc.maximumSellingPrice} />
              <Field label="Other-Cost Multiplier" name="otherCostMultiplier" defaultValue={calc.otherCostMultiplier} step="0.1" />
              <Field label="Minimum Yield Multiplier" name="minimumYieldMultiplier" defaultValue={calc.minimumYieldMultiplier} />
              <Field label="Maximum Yield Multiplier" name="maximumYieldMultiplier" defaultValue={calc.maximumYieldMultiplier} />
            </div>
            <div>
              <label className={labelClass}>Disclaimer</label>
              <textarea name="disclaimer" defaultValue={calc.disclaimer} rows={2} className={inputClass} />
            </div>
          </SettingsForm>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-lighter bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">Weather Alert Thresholds</h2>
        <p className="mt-1 text-sm text-brand-dark/60">
          Configurable thresholds for the farmer weather alerts engine.
        </p>
        <div className="mt-4">
          <SettingsForm action={updateWeatherThresholds}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Late Blight Humidity (%)" name="lateBlightHumidityPct" defaultValue={weather.lateBlightHumidityPct} />
              <Field label="Late Blight Min Temp (°C)" name="lateBlightMinTempC" defaultValue={weather.lateBlightMinTempC} />
              <Field label="Late Blight Max Temp (°C)" name="lateBlightMaxTempC" defaultValue={weather.lateBlightMaxTempC} />
              <Field label="Planting Min Soil Temp (°C)" name="plantingMinSoilTempC" defaultValue={weather.plantingMinSoilTempC} />
              <Field label="Frost Temp (°C)" name="frostTempC" defaultValue={weather.frostTempC} />
            </div>
          </SettingsForm>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-lighter bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-brand-dark">Admin Announcements</h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            await createAnnouncement(formData);
          }}
          className="mt-4 grid gap-3 sm:grid-cols-4"
        >
          <input name="title" required placeholder="Title" className={`sm:col-span-2 ${inputClass} mt-0`} />
          <select name="severity" className={`${inputClass} mt-0`} defaultValue="INFO">
            <option value="INFO">Info</option>
            <option value="AMBER">Warning</option>
            <option value="RED">Danger</option>
          </select>
          <button type="submit" className="rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium">
            Publish
          </button>
          <textarea
            name="message"
            required
            placeholder="Announcement message"
            rows={2}
            className={`sm:col-span-4 ${inputClass} mt-0`}
          />
        </form>

        <div className="mt-6 space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-brand-lighter p-4">
              <div>
                <p className="font-semibold text-brand-dark">{a.title}</p>
                <p className="mt-1 text-sm text-brand-dark/70">{a.message}</p>
              </div>
              <AnnouncementToggle id={a.id} status={a.status} />
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-sm text-brand-dark/50">No announcements yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  defaultValue: number;
  step?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        step={step ?? "1"}
        required
        className={inputClass}
      />
    </div>
  );
}
