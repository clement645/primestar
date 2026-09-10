import { describe, it, expect } from "vitest";
import {
  evaluateWeatherAlerts,
  getRainOutlook,
  getFarmingSuggestions,
  DEFAULT_WEATHER_THRESHOLDS,
  type DailyForecastPoint,
} from "@/lib/weatherRules";

describe("weather alert rules engine", () => {
  it("flags a frost warning below 0°C and prioritizes it first", () => {
    const alerts = evaluateWeatherAlerts({
      temperatureC: -1,
      humidityPct: 90,
      soilTemperatureC: 5,
    });
    expect(alerts[0].id).toBe("frost-warning");
    expect(alerts[0].severity).toBe("RED");
  });

  it("flags late blight risk when humidity > 85% and temp in warm range", () => {
    const alerts = evaluateWeatherAlerts({ temperatureC: 18, humidityPct: 90 });
    expect(alerts.some((a) => a.id === "late-blight-risk")).toBe(true);
  });

  it("does not flag late blight risk when humidity is below threshold", () => {
    const alerts = evaluateWeatherAlerts({ temperatureC: 18, humidityPct: 60 });
    expect(alerts.some((a) => a.id === "late-blight-risk")).toBe(false);
  });

  it("flags planting safety warning when soil temp is below 7°C", () => {
    const alerts = evaluateWeatherAlerts({
      temperatureC: 15,
      humidityPct: 50,
      soilTemperatureC: 5,
    });
    expect(alerts.some((a) => a.id === "planting-safety")).toBe(true);
  });

  it("respects configurable thresholds", () => {
    const alerts = evaluateWeatherAlerts(
      { temperatureC: 18, humidityPct: 70 },
      { ...DEFAULT_WEATHER_THRESHOLDS, lateBlightHumidityPct: 65 }
    );
    expect(alerts.some((a) => a.id === "late-blight-risk")).toBe(true);
  });
});

describe("rain outlook", () => {
  const forecast: DailyForecastPoint[] = [
    { date: "2026-09-10", minTempC: 12, maxTempC: 20, precipitationMm: 0 },
    { date: "2026-09-11", minTempC: 12, maxTempC: 20, precipitationMm: 8 },
    { date: "2026-09-12", minTempC: 12, maxTempC: 20, precipitationMm: 0 },
  ];

  it("detects rain today", () => {
    const rainy: DailyForecastPoint[] = [
      { date: "2026-09-10", minTempC: 12, maxTempC: 20, precipitationMm: 5 },
      ...forecast.slice(1),
    ];
    const outlook = getRainOutlook(rainy);
    expect(outlook.willRainToday).toBe(true);
    expect(outlook.willRainSoon).toBe(true);
  });

  it("detects rain coming later in the forecast, not today", () => {
    const outlook = getRainOutlook(forecast);
    expect(outlook.willRainToday).toBe(false);
    expect(outlook.willRainSoon).toBe(true);
    expect(outlook.nextRainDate).toBe("2026-09-11");
  });

  it("reports no rain soon when nothing in the forecast crosses the threshold", () => {
    const dry: DailyForecastPoint[] = forecast.map((d) => ({ ...d, precipitationMm: 0 }));
    const outlook = getRainOutlook(dry);
    expect(outlook.willRainToday).toBe(false);
    expect(outlook.willRainSoon).toBe(false);
    expect(outlook.nextRainDate).toBeNull();
  });
});

describe("farming suggestions", () => {
  it("suggests delaying spraying when rain is expected today", () => {
    const rainy: DailyForecastPoint[] = [
      { date: "2026-09-10", minTempC: 12, maxTempC: 20, precipitationMm: 5 },
    ];
    const suggestions = getFarmingSuggestions({ dailyForecast: rainy, humidityPct: 70 });
    expect(suggestions.some((s) => s.id === "rain-today-delay-spraying")).toBe(true);
  });

  it("suggests irrigation when no rain is expected", () => {
    const dry: DailyForecastPoint[] = [
      { date: "2026-09-10", minTempC: 12, maxTempC: 20, precipitationMm: 0 },
    ];
    const suggestions = getFarmingSuggestions({ dailyForecast: dry, humidityPct: 40 });
    expect(suggestions.some((s) => s.id === "no-rain-consider-irrigation")).toBe(true);
  });

  it("warns about spraying in high wind", () => {
    const dry: DailyForecastPoint[] = [
      { date: "2026-09-10", minTempC: 12, maxTempC: 20, precipitationMm: 0 },
    ];
    const suggestions = getFarmingSuggestions({ dailyForecast: dry, humidityPct: 40, windSpeedKmh: 30 });
    expect(suggestions.some((s) => s.id === "high-wind-avoid-spraying")).toBe(true);
  });
});
