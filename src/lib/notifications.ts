import { prisma } from "@/lib/db";
import { getWeatherForLocation } from "@/lib/weather";
import { evaluateWeatherAlerts } from "@/lib/weatherRules";
import { getDueCropStageRules } from "@/lib/cropStage";

/**
 * Generates any new notifications a farmer is due (weather alerts,
 * crop-stage reminders, active admin announcements) and persists them,
 * using stable `sourceRef` keys so the same condition is never notified
 * twice (section 79 — avoid alert fatigue on every dashboard refresh).
 */
export async function syncFarmerNotifications(farmerId: string): Promise<void> {
  const farmer = await prisma.farmerProfile.findUnique({ where: { id: farmerId } });
  if (!farmer) return;

  const todayKey = new Date().toISOString().slice(0, 10);

  // --- Weather alerts ---
  if (farmer.notifyWeather && farmer.defaultLatitude != null && farmer.defaultLongitude != null) {
    try {
      const weather = await getWeatherForLocation(farmer.defaultLatitude, farmer.defaultLongitude);
      if (weather) {
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
          thresholds
        );

        for (const alert of alerts.filter((a) => a.severity !== "INFO")) {
          const sourceRef = `weather:${alert.id}:${todayKey}`;
          const exists = await prisma.farmerNotification.findFirst({
            where: { farmerId, sourceRef },
          });
          if (!exists) {
            await prisma.farmerNotification.create({
              data: {
                farmerId,
                type: "WEATHER",
                severity: alert.severity,
                title: alert.title,
                message: alert.message,
                sourceRef,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error("weather notification sync failed", err);
    }
  }

  // --- Crop stage reminders ---
  if (farmer.notifyCropStage && farmer.plantingDate) {
    const rules = await prisma.cropStageRule.findMany({ where: { status: "ACTIVE" } });
    const sent = await prisma.sentCropReminder.findMany({ where: { farmerId } });
    const sentRuleIds = new Set(sent.map((s) => s.ruleId));

    const due = getDueCropStageRules(farmer.plantingDate, rules, sentRuleIds);
    for (const rule of due) {
      await prisma.$transaction([
        prisma.farmerNotification.create({
          data: {
            farmerId,
            type: "CROP_STAGE",
            severity: rule.priority >= 4 ? "AMBER" : "INFO",
            title: rule.name,
            message: rule.notificationMessage,
            sourceRef: `crop-stage:${rule.id}`,
          },
        }),
        prisma.sentCropReminder.create({ data: { farmerId, ruleId: rule.id } }),
      ]);
    }
  }

  // --- Admin announcements ---
  if (farmer.notifyAdmin) {
    const now = new Date();
    const announcements = await prisma.adminAnnouncement.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
    });

    for (const a of announcements) {
      const sourceRef = `admin:${a.id}`;
      const exists = await prisma.farmerNotification.findFirst({ where: { farmerId, sourceRef } });
      if (!exists) {
        await prisma.farmerNotification.create({
          data: {
            farmerId,
            type: "ADMIN",
            severity: a.severity,
            title: a.title,
            message: a.message,
            sourceRef,
          },
        });
      }
    }
  }
}
