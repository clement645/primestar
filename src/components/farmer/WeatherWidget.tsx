"use client";

import { useCallback, useEffect, useState } from "react";
import type { NormalizedWeather } from "@/lib/weather";
import type { WeatherAlert, RainOutlook, FarmingSuggestion } from "@/lib/weatherRules";

type LoadState = "idle" | "loading" | "ready" | "denied" | "unavailable" | "unsupported" | "error";

const SEVERITY_STYLES: Record<string, string> = {
  RED: "bg-red-50 border-red-300 text-red-800",
  AMBER: "bg-amber-50 border-amber-300 text-amber-800",
  INFO: "bg-blue-50 border-blue-300 text-blue-800",
};

export default function WeatherWidget({
  initialLat,
  initialLon,
  locationLabel,
}: {
  initialLat: number | null;
  initialLon: number | null;
  locationLabel: string | null;
}) {
  const [state, setState] = useState<LoadState>("idle");
  const [weather, setWeather] = useState<NormalizedWeather | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [rainOutlook, setRainOutlook] = useState<RainOutlook | null>(null);
  const [suggestions, setSuggestions] = useState<FarmingSuggestion[]>([]);
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null);
  const [usingGps, setUsingGps] = useState(false);
  const [saveOffer, setSaveOffer] = useState<{ lat: number; lon: number } | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setState("loading");
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        setState("error");
        return;
      }
      const data = await res.json();
      setWeather(data.weather);
      setAlerts(data.alerts ?? []);
      setRainOutlook(data.rainOutlook ?? null);
      setSuggestions(data.suggestions ?? []);
      setResolvedLocation(data.locationLabel ?? null);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount from server-provided initial coordinates: intentional.
    if (initialLat != null && initialLon != null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchWeather(initialLat, initialLon);
    }
  }, [initialLat, initialLon, fetchWeather]);

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setState("unsupported");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUsingGps(true);
        setSaveOffer({ lat: latitude, lon: longitude });
        fetchWeather(latitude, longitude);
      },
      (err) => {
        setState(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  async function saveThisLocation() {
    if (!saveOffer) return;
    try {
      await fetch("/api/farmer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveLocation: { latitude: saveOffer.lat, longitude: saveOffer.lon } }),
      });
      setSaved(true);
    } catch {
      // non-critical — the weather lookup already succeeded either way
    }
  }

  return (
    <div className="rounded-2xl border border-brand-lighter bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-brand-dark">Farm Weather</h2>
          <p className="text-sm text-brand-dark/60">
            {resolvedLocation ? (
              <>
                📍 {resolvedLocation}
                {usingGps && <span className="text-brand-dark/40"> (current field location)</span>}
              </>
            ) : usingGps ? (
              "Using your current field location"
            ) : (
              locationLabel ?? "No location set yet"
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="rounded-full border-2 border-brand-dark px-4 py-2 text-xs font-semibold text-brand-dark hover:bg-brand-dark hover:text-white"
        >
          📍 Use My Current Field Location
        </button>
      </div>

      <div className="mt-5">
        {state === "loading" && <p className="text-sm text-brand-dark/60">Loading weather…</p>}
        {state === "denied" && (
          <p className="text-sm text-brand-dark/60">
            Location permission was not granted. You can still set a region in your profile below.
          </p>
        )}
        {state === "unavailable" && (
          <p className="text-sm text-brand-dark/60">
            We couldn&apos;t determine your location right now. Please try again or set a region below.
          </p>
        )}
        {state === "unsupported" && (
          <p className="text-sm text-brand-dark/60">
            Your browser does not support location lookup. Please set a region below.
          </p>
        )}
        {state === "error" && (
          <p className="text-sm text-brand-dark/60">
            Weather is temporarily unavailable. Please try refreshing shortly.
          </p>
        )}
        {state === "idle" && initialLat == null && (
          <p className="text-sm text-brand-dark/60">
            Set a default region in your profile, or use your current field location, to see weather here.
          </p>
        )}

        {weather && (
          <div>
            {weather.stale && (
              <p className="mb-3 rounded-lg bg-brand-amber/10 px-3 py-2 text-xs text-brand-earth">
                Showing the most recent saved weather — live data is temporarily unavailable.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="font-heading text-4xl font-extrabold text-brand-dark">
                  {Math.round(weather.temperatureC)}°C
                </p>
                <p className="text-sm text-brand-dark/60">{weather.condition}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-brand-dark/70">
                <span>Humidity: {weather.humidityPct}%</span>
                {weather.windSpeedKmh != null && <span>Wind: {Math.round(weather.windSpeedKmh)} km/h</span>}
                {weather.precipitationMm != null && <span>Rain now: {weather.precipitationMm} mm</span>}
                {weather.soilTemperatureC != null && (
                  <span>Soil: {Math.round(weather.soilTemperatureC)}°C</span>
                )}
              </div>
            </div>

            {rainOutlook && (
              <div
                className={`mt-5 flex items-center gap-3 rounded-xl border p-4 ${
                  rainOutlook.willRainToday
                    ? "border-blue-300 bg-blue-50"
                    : rainOutlook.willRainSoon
                    ? "border-sky-200 bg-sky-50"
                    : "border-brand-lighter bg-brand-lighter/40"
                }`}
              >
                <span className="text-2xl">
                  {rainOutlook.willRainToday ? "🌧️" : rainOutlook.willRainSoon ? "🌦️" : "☀️"}
                </span>
                <div>
                  <p className="font-semibold text-brand-dark">
                    {rainOutlook.willRainToday
                      ? "Rain expected today"
                      : rainOutlook.willRainSoon
                      ? `Rain expected around ${new Date(rainOutlook.nextRainDate!).toLocaleDateString("en-KE", { weekday: "long" })}`
                      : "No significant rain expected soon"}
                  </p>
                  <p className="text-xs text-brand-dark/60">
                    Total expected rainfall over the forecast: {rainOutlook.totalPrecipitationMm} mm
                  </p>
                </div>
              </div>
            )}

            {weather.dailyForecast.length > 0 && (
              <div className="mt-5 grid grid-cols-5 gap-2 text-center text-xs">
                {weather.dailyForecast.map((d) => (
                  <div key={d.date} className="rounded-lg bg-brand-lighter/60 p-2">
                    <p className="font-semibold text-brand-dark">
                      {new Date(d.date).toLocaleDateString("en-KE", { weekday: "short" })}
                    </p>
                    <p className="mt-1 text-brand-dark/70">
                      {Math.round(d.minTempC)}°–{Math.round(d.maxTempC)}°
                    </p>
                    <p className="mt-1 text-blue-600">
                      {d.precipitationMm >= 1 ? `🌧️ ${d.precipitationMm}mm` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {alerts.length > 0 && (
              <div className="mt-5 space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-3 text-sm ${SEVERITY_STYLES[alert.severity]}`}
                  >
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-0.5">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-brand-dark">Suggested Actions</p>
                <div className="mt-2 space-y-2">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-2 rounded-xl border border-brand-medium/30 bg-brand-lighter/40 p-3 text-sm text-brand-dark/80"
                    >
                      <span className="text-lg leading-none">{s.icon}</span>
                      <p>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-brand-dark/40">
              Last updated {new Date(weather.fetchedAt).toLocaleTimeString("en-KE")}. Weather guidance is
              informational, not a guarantee — use your own judgment and local knowledge.
            </p>

            {saveOffer && !saved && (
              <button
                type="button"
                onClick={saveThisLocation}
                className="mt-4 rounded-full bg-brand-medium px-5 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                Save this location to my profile
              </button>
            )}
            {saved && <p className="mt-3 text-xs font-semibold text-green-700">Location saved ✓</p>}
          </div>
        )}
      </div>
    </div>
  );
}
