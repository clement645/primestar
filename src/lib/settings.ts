import { prisma } from "@/lib/db";
import {
  BUSINESS_NAME,
  FACEBOOK_URL,
  REFERRAL_ATTRIBUTION_DAYS_DEFAULT,
  TIKTOK_URL,
  WHATSAPP_NUMBER_INTL,
} from "@/lib/constants";

/**
 * Site-wide editable settings, stored as a single row so the admin can
 * change business details (section 45) without a code deploy. Falls back
 * to the supplied business defaults if the row hasn't been seeded yet.
 */
export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;

  return {
    id: 1,
    businessName: BUSINESS_NAME,
    businessDescription:
      "Quality potato seed information and practical farming knowledge for farmers.",
    whatsappNumber: WHATSAPP_NUMBER_INTL,
    facebookUrl: FACEBOOK_URL,
    tiktokUrl: TIKTOK_URL,
    contactEmail: null,
    physicalAddress: "Kimumu, Eldoret, Kenya",
    openingHours: "24/7",
    referralAttributionDays: REFERRAL_ATTRIBUTION_DAYS_DEFAULT,
    seoDefaultTitle: "Primestar Potato Seeds | Quality Shangi Potato Seeds Kenya",
    seoDefaultDescription:
      "Quality Shangi potato seeds and practical potato farming guidance for Kenyan farmers.",
    updatedAt: new Date(),
  };
}

export async function getCalculatorSettings() {
  const settings = await prisma.calculatorSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;

  return {
    id: 1,
    seedBagsPerAcre: 10,
    seedBagWeightKg: 65,
    defaultSeedPrice: 2750,
    minimumSellingPrice: 1500,
    maximumSellingPrice: 5000,
    otherCostMultiplier: 1.5,
    minimumYieldMultiplier: 8,
    maximumYieldMultiplier: 12,
    disclaimer:
      "These are planning estimates. Actual costs, yields, weather, market prices and farm performance may differ.",
    updatedBy: null,
    updatedAt: new Date(),
  };
}
