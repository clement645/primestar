-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'WORKER', 'FARMER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('WEATHER', 'CROP_STAGE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('RED', 'AMBER', 'INFO');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_clicks" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "visitor_id" TEXT,
    "landing_page" TEXT NOT NULL,
    "device_type" TEXT,
    "source" TEXT DEFAULT 'direct',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversions" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT,
    "referral_code" TEXT,
    "visitor_id" TEXT,
    "page" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" TEXT NOT NULL,
    "featured_image" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Primestar Potato Seeds',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "reading_minutes" INTEGER,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featured_image" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Primestar Potato Seeds',
    "reading_minutes" INTEGER,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "business_name" TEXT NOT NULL DEFAULT 'Primestar Potato Seeds',
    "business_description" TEXT NOT NULL DEFAULT 'Quality potato seed information and practical farming knowledge for farmers.',
    "whatsapp_number" TEXT NOT NULL DEFAULT '254728623619',
    "facebook_url" TEXT NOT NULL DEFAULT 'https://www.facebook.com/profile.php?id=100082359937150',
    "tiktok_url" TEXT NOT NULL DEFAULT 'https://www.tiktok.com/@primestar.potato',
    "contact_email" TEXT,
    "physical_address" TEXT,
    "opening_hours" TEXT,
    "referral_attribution_days" INTEGER NOT NULL DEFAULT 30,
    "seo_default_title" TEXT NOT NULL DEFAULT 'Primestar Potato Seeds | Quality Shangi Potato Seeds Kenya',
    "seo_default_description" TEXT NOT NULL DEFAULT 'Quality Shangi potato seeds and practical potato farming guidance for Kenyan farmers.',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "default_region" TEXT,
    "default_postal_code" TEXT,
    "default_latitude" DOUBLE PRECISION,
    "default_longitude" DOUBLE PRECISION,
    "planting_date" TIMESTAMP(3),
    "notify_weather" BOOLEAN NOT NULL DEFAULT true,
    "notify_crop_stage" BOOLEAN NOT NULL DEFAULT true,
    "notify_admin" BOOLEAN NOT NULL DEFAULT true,
    "referral_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_cache" (
    "id" TEXT NOT NULL,
    "location_key" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'open-meteo',
    "payload" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer_notifications" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source_ref" TEXT,
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farmer_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_stage_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "days_after_planting" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notification_message" TEXT NOT NULL,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_stage_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sent_crop_reminders" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_crop_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_alert_rule_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "late_blight_humidity_pct" DOUBLE PRECISION NOT NULL DEFAULT 85,
    "late_blight_min_temp_c" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "late_blight_max_temp_c" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "planting_min_soil_temp_c" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "frost_temp_c" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_alert_rule_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculator_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "seed_bags_per_acre" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "seed_bag_weight_kg" DOUBLE PRECISION NOT NULL DEFAULT 65,
    "default_seed_price" DOUBLE PRECISION NOT NULL DEFAULT 2750,
    "minimum_selling_price" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "maximum_selling_price" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "other_cost_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "minimum_yield_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "maximum_yield_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 12,
    "disclaimer" TEXT NOT NULL DEFAULT 'These are planning estimates. Actual costs, yields, weather, market prices and farm performance may differ.',
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calculator_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer_calculations" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "acres" DOUBLE PRECISION NOT NULL,
    "seed_bags" DOUBLE PRECISION NOT NULL,
    "seed_weight_kg" DOUBLE PRECISION NOT NULL,
    "seed_price" DOUBLE PRECISION NOT NULL,
    "seed_cost" DOUBLE PRECISION NOT NULL,
    "other_costs" DOUBLE PRECISION NOT NULL,
    "total_investment" DOUBLE PRECISION NOT NULL,
    "minimum_yield_bags" DOUBLE PRECISION NOT NULL,
    "maximum_yield_bags" DOUBLE PRECISION NOT NULL,
    "selling_price" DOUBLE PRECISION NOT NULL,
    "minimum_revenue" DOUBLE PRECISION NOT NULL,
    "maximum_revenue" DOUBLE PRECISION NOT NULL,
    "minimum_profit" DOUBLE PRECISION NOT NULL,
    "maximum_profit" DOUBLE PRECISION NOT NULL,
    "minimum_roi" DOUBLE PRECISION NOT NULL,
    "maximum_roi" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farmer_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "workers_user_id_key" ON "workers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workers_referral_code_key" ON "workers"("referral_code");

-- CreateIndex
CREATE INDEX "referral_clicks_worker_id_idx" ON "referral_clicks"("worker_id");

-- CreateIndex
CREATE INDEX "referral_clicks_created_at_idx" ON "referral_clicks"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "referral_clicks_worker_id_ip_hash_key" ON "referral_clicks"("worker_id", "ip_hash");

-- CreateIndex
CREATE INDEX "whatsapp_conversions_worker_id_idx" ON "whatsapp_conversions"("worker_id");

-- CreateIndex
CREATE INDEX "whatsapp_conversions_created_at_idx" ON "whatsapp_conversions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at");

-- CreateIndex
CREATE INDEX "blog_posts_category_idx" ON "blog_posts"("category");

-- CreateIndex
CREATE UNIQUE INDEX "guide_articles_slug_key" ON "guide_articles"("slug");

-- CreateIndex
CREATE INDEX "guide_articles_section_idx" ON "guide_articles"("section");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_profiles_user_id_key" ON "farmer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "weather_cache_location_key_key" ON "weather_cache"("location_key");

-- CreateIndex
CREATE INDEX "weather_cache_expires_at_idx" ON "weather_cache"("expires_at");

-- CreateIndex
CREATE INDEX "farmer_notifications_farmer_id_created_at_idx" ON "farmer_notifications"("farmer_id", "created_at");

-- CreateIndex
CREATE INDEX "farmer_notifications_farmer_id_read_at_idx" ON "farmer_notifications"("farmer_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "sent_crop_reminders_farmer_id_rule_id_key" ON "sent_crop_reminders"("farmer_id", "rule_id");

-- CreateIndex
CREATE INDEX "farmer_calculations_farmer_id_created_at_idx" ON "farmer_calculations"("farmer_id", "created_at");

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_clicks" ADD CONSTRAINT "referral_clicks_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversions" ADD CONSTRAINT "whatsapp_conversions_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_profiles" ADD CONSTRAINT "farmer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_notifications" ADD CONSTRAINT "farmer_notifications_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_crop_reminders" ADD CONSTRAINT "sent_crop_reminders_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_crop_reminders" ADD CONSTRAINT "sent_crop_reminders_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "crop_stage_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_calculations" ADD CONSTRAINT "farmer_calculations_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
