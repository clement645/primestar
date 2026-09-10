// Business constants for Primestar Potato Seeds.
// Values here are the ones explicitly supplied by the business; anything
// not supplied (address, prices, certifications, etc.) is left as an
// editable placeholder in SiteSettings / content rather than hardcoded here.

export const WHATSAPP_NUMBER_INTL = "254728623619";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER_INTL}`;

export function whatsappUrl(message?: string) {
  if (!message) return WHATSAPP_URL;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=100082359937150";
export const TIKTOK_URL = "https://www.tiktok.com/@primestar.potato";

export const BUSINESS_NAME = "Primestar Potato Seeds";

export const REFERRAL_COOKIE_NAME = "referral_code";
export const REFERRAL_ATTRIBUTION_DAYS_DEFAULT = 30;

export const VISITOR_COOKIE_NAME = "psv_id";
