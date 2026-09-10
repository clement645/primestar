import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const CACHE_TTL_MINUTES = 30;

export interface NormalizedWeather {
  temperatureC: number;
  humidityPct: number;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  soilTemperatureC: number | null;
  condition: string;
  forecastMinTempC: number | null;
  forecastMaxTempC: number | null;
  dailyForecast: { date: string; minTempC: number; maxTempC: number; precipitationMm: number }[];
  fetchedAt: string;
  stale: boolean;
}

function locationKey(lat: number, lon: number) {
  // Round to ~1km precision so nearby requests share a cache entry rather
  // than storing (and re-fetching for) every exact GPS reading.
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

function validateCoords(lat: number, lon: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false;
  return true;
}

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
};

/**
 * Fetch current + forecast weather from Open-Meteo (no API key required),
 * caching results server-side so repeated dashboard loads/refreshes don't
 * hammer the external API (sections 59, 78).
 */
export async function getWeatherForLocation(
  lat: number,
  lon: number
): Promise<NormalizedWeather | null> {
  if (!validateCoords(lat, lon)) {
    throw new Error("Invalid coordinates");
  }

  const key = locationKey(lat, lon);
  const cached = await prisma.weatherCache.findUnique({ where: { locationKey: key } });

  if (cached && cached.expiresAt > new Date()) {
    return { ...(cached.payload as unknown as NormalizedWeather), stale: false };
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toFixed(4));
    url.searchParams.set("longitude", lon.toFixed(4));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,soil_temperature_0cm"
    );
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "5");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
    const json = await res.json();

    const current = json.current ?? {};
    const daily = json.daily ?? {};

    const dailyForecast = (daily.time ?? []).map((date: string, i: number) => ({
      date,
      minTempC: daily.temperature_2m_min?.[i] ?? null,
      maxTempC: daily.temperature_2m_max?.[i] ?? null,
      precipitationMm: daily.precipitation_sum?.[i] ?? null,
    }));

    const normalized: NormalizedWeather = {
      temperatureC: current.temperature_2m ?? 0,
      humidityPct: current.relative_humidity_2m ?? 0,
      windSpeedKmh: current.wind_speed_10m ?? null,
      precipitationMm: current.precipitation ?? null,
      soilTemperatureC: current.soil_temperature_0cm ?? null,
      condition: WMO_CONDITIONS[current.weather_code as number] ?? "Unknown",
      forecastMinTempC: dailyForecast[0]?.minTempC ?? null,
      forecastMaxTempC: dailyForecast[0]?.maxTempC ?? null,
      dailyForecast,
      fetchedAt: new Date().toISOString(),
      stale: false,
    };

    await prisma.weatherCache.upsert({
      where: { locationKey: key },
      update: {
        payload: normalized as unknown as Prisma.InputJsonValue,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
      },
      create: {
        locationKey: key,
        latitude: lat,
        longitude: lon,
        payload: normalized as unknown as Prisma.InputJsonValue,
        expiresAt: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
      },
    });

    return normalized;
  } catch (err) {
    console.error("weather fetch failed", err);
    // Provider unavailable — fall back to the last cached result if we
    // have one, clearly marked as stale, rather than fabricating data.
    if (cached) {
      return { ...(cached.payload as unknown as NormalizedWeather), stale: true };
    }
    return null;
  }
}
