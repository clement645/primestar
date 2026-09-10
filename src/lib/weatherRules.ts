// Server-side agricultural weather rules engine (section 60/79).
// Converts raw weather readings into farmer-friendly alerts. Thresholds are
// administrator-configurable (see WeatherAlertRuleConfig) rather than
// hardcoded permanently — the defaults below are only the initial values.

export type AlertSeverity = "RED" | "AMBER" | "INFO";

export interface WeatherAlert {
  id: string; // stable identifier so the same condition doesn't spam duplicate notifications
  severity: AlertSeverity;
  title: string;
  message: string;
}

export interface WeatherReading {
  temperatureC: number;
  humidityPct: number;
  soilTemperatureC?: number | null;
  forecastMinTempC?: number | null;
}

export interface WeatherRuleThresholds {
  lateBlightHumidityPct: number;
  lateBlightMinTempC: number;
  lateBlightMaxTempC: number;
  plantingMinSoilTempC: number;
  frostTempC: number;
}

export const DEFAULT_WEATHER_THRESHOLDS: WeatherRuleThresholds = {
  lateBlightHumidityPct: 85,
  lateBlightMinTempC: 10,
  lateBlightMaxTempC: 25,
  plantingMinSoilTempC: 7,
  frostTempC: 0,
};

/**
 * Evaluate weather conditions against the configured thresholds and return
 * a prioritized list of alerts (RED first, then AMBER, then INFO).
 * Wording is deliberately framed as guidance, never a diagnosis or guarantee.
 */
export function evaluateWeatherAlerts(
  reading: WeatherReading,
  thresholds: WeatherRuleThresholds = DEFAULT_WEATHER_THRESHOLDS
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  const frostTemp = reading.forecastMinTempC ?? reading.temperatureC;
  if (frostTemp < thresholds.frostTempC) {
    alerts.push({
      id: "frost-warning",
      severity: "RED",
      title: "Frost Warning",
      message:
        "Frost warning: temperatures are forecast below 0°C. Protect vulnerable crops where appropriate and seek local agricultural advice.",
    });
  }

  if (
    reading.humidityPct > thresholds.lateBlightHumidityPct &&
    reading.temperatureC >= thresholds.lateBlightMinTempC &&
    reading.temperatureC <= thresholds.lateBlightMaxTempC
  ) {
    alerts.push({
      id: "late-blight-risk",
      severity: "AMBER",
      title: "Late Blight Risk",
      message:
        "Late blight conditions may be favorable. Inspect the crop and seek appropriate agricultural guidance.",
    });
  }

  if (
    reading.soilTemperatureC !== null &&
    reading.soilTemperatureC !== undefined &&
    reading.soilTemperatureC < thresholds.plantingMinSoilTempC
  ) {
    alerts.push({
      id: "planting-safety",
      severity: "AMBER",
      title: "Planting Safety",
      message:
        "Soil temperature is below 7°C. Conditions may not be suitable for planting potatoes.",
    });
  }

  const severityOrder: Record<AlertSeverity, number> = { RED: 0, AMBER: 1, INFO: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ---------------------------------------------------------------------------
// Rain outlook + actionable farming suggestions
// ---------------------------------------------------------------------------

export interface DailyForecastPoint {
  date: string;
  minTempC: number;
  maxTempC: number;
  precipitationMm: number;
}

export interface RainOutlook {
  willRainToday: boolean;
  willRainSoon: boolean; // within the available forecast window
  nextRainDate: string | null;
  totalPrecipitationMm: number;
}

/** Summarize the forecast into a simple "will it rain?" answer a farmer can act on. */
export function getRainOutlook(
  dailyForecast: DailyForecastPoint[],
  rainThresholdMm = 1
): RainOutlook {
  const today = dailyForecast[0];
  const willRainToday = (today?.precipitationMm ?? 0) >= rainThresholdMm;
  const nextRainDay = dailyForecast.find((d) => d.precipitationMm >= rainThresholdMm);
  const totalPrecipitationMm = dailyForecast.reduce(
    (sum, d) => sum + (d.precipitationMm || 0),
    0
  );

  return {
    willRainToday,
    willRainSoon: Boolean(nextRainDay),
    nextRainDate: nextRainDay?.date ?? null,
    totalPrecipitationMm: Math.round(totalPrecipitationMm * 10) / 10,
  };
}

export interface FarmingSuggestion {
  id: string;
  icon: string;
  text: string;
}

/**
 * Turn the rain outlook (and other current conditions) into short,
 * actionable suggestions for the farmer — e.g. whether to delay spraying or
 * consider irrigating. Framed as guidance, never a guarantee (section 59).
 */
export function getFarmingSuggestions(
  params: {
    dailyForecast: DailyForecastPoint[];
    windSpeedKmh?: number | null;
    humidityPct: number;
  },
  rainThresholdMm = 1,
  windThresholdKmh = 25
): FarmingSuggestion[] {
  const suggestions: FarmingSuggestion[] = [];
  const outlook = getRainOutlook(params.dailyForecast, rainThresholdMm);

  if (outlook.willRainToday) {
    suggestions.push({
      id: "rain-today-delay-spraying",
      icon: "🌧️",
      text: "Rain is expected today. Consider delaying pesticide, fungicide or fertilizer application so it isn't washed away.",
    });
  } else if (outlook.willRainSoon && outlook.nextRainDate) {
    suggestions.push({
      id: "rain-soon",
      icon: "🌦️",
      text: `Rain looks likely around ${outlook.nextRainDate}. Consider planning spraying or top-dressing before or after that, rather than during the rain.`,
    });
  } else {
    suggestions.push({
      id: "no-rain-consider-irrigation",
      icon: "☀️",
      text: "No significant rain is expected in the coming days. If soil moisture feels low — especially during tuber bulking — consider irrigating where possible.",
    });
  }

  if (params.windSpeedKmh != null && params.windSpeedKmh >= windThresholdKmh) {
    suggestions.push({
      id: "high-wind-avoid-spraying",
      icon: "💨",
      text: "Winds are currently strong. Avoid spraying now, since chemicals may drift away from the target crop.",
    });
  }

  return suggestions;
}
