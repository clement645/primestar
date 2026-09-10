"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  defaultRegion: string;
  defaultPostalCode: string;
  plantingDate: string; // yyyy-mm-dd or ""
}

export default function ProfileSettingsForm({ defaultRegion, defaultPostalCode, plantingDate }: Props) {
  const router = useRouter();
  const [region, setRegion] = useState(defaultRegion);
  const [postalCode, setPostalCode] = useState(defaultPostalCode);
  const [planting, setPlanting] = useState(plantingDate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/farmer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defaultRegion: region,
        defaultPostalCode: postalCode,
        plantingDate: planting ? new Date(planting).toISOString() : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-brand-lighter bg-white p-6">
      <h2 className="font-heading text-lg font-bold text-brand-dark">Farm Details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-brand-dark">Default Region</label>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. Nyandarua"
            className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-brand-dark">Postal Code (optional)</label>
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-brand-dark">Planting Date (active crop)</label>
          <input
            type="date"
            value={planting}
            onChange={(e) => setPlanting(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
          />
          <p className="mt-1 text-xs text-brand-dark/50">
            Used to generate crop-stage reminders.
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Farm Details"}
        </button>
        {saved && <span className="text-sm font-semibold text-green-700">Saved ✓</span>}
      </div>
    </form>
  );
}
