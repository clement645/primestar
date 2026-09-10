import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getWeatherForLocation } from "@/lib/weather";
import {
  evaluateWeatherAlerts,
  getRainOutlook,
  getFarmingSuggestions,
  DEFAULT_WEATHER_THRESHOLDS,
} from "@/lib/weatherRules";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/referral";
import { isRateLimited } from "@/lib/rateLimit";
import { reverseGeocode } from "@/lib/geocode";

export const runtime = "nodejs";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

/**
 * Server-side weather endpoint (sections 59, 78). Coordinates are validated
 * and rate-limited so this can't be turned into an open weather-API proxy;
 * results are cached in Postgres to avoid hammering Open-Meteo.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (isRateLimited(`weather:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests, please try again shortly." }, { status: 429 });
  }

  const parsed = querySchema.safeParse({
    lat: request.nextUrl.searchParams.get("lat"),
    lon: request.nextUrl.searchParams.get("lon"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid lat and lon are required." }, { status: 400 });
  }

  const [weather, place] = await Promise.all([
    getWeatherForLocation(parsed.data.lat, parsed.data.lon),
    reverseGeocode(parsed.data.lat, parsed.data.lon),
  ]);

  if (!weather) {
    return NextResponse.json(
      { error: "Weather data is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const thresholds = await prisma.weatherAlertRuleConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const alerts = evaluateWeatherAlerts(
    {
      temperatureC: weather.temperatureC,
      humidityPct: weather.humidityPct,
      soilTemperatureC: weather.soilTemperatureC,
      forecastMinTempC: weather.forecastMinTempC,
    },
    thresholds ?? DEFAULT_WEATHER_THRESHOLDS
  );

  const rainOutlook = getRainOutlook(weather.dailyForecast);
  const suggestions = getFarmingSuggestions({
    dailyForecast: weather.dailyForecast,
    windSpeedKmh: weather.windSpeedKmh,
    humidityPct: weather.humidityPct,
  });

  return NextResponse.json({
    weather,
    alerts,
    rainOutlook,
    suggestions,
    locationLabel: place?.label ?? null,
  });
}
