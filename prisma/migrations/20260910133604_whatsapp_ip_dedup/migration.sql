-- Add ip_hash to whatsapp_conversions and enforce one counted WhatsApp
-- click per IP per worker, mirroring the referral_clicks rule.
-- Existing rows get NULL ip_hash, which Postgres treats as distinct in a
-- unique index, so no existing data can violate this constraint.

ALTER TABLE "whatsapp_conversions" ADD COLUMN "ip_hash" TEXT;

CREATE UNIQUE INDEX "worker_whatsapp_ip_unique" ON "whatsapp_conversions"("worker_id", "ip_hash");
