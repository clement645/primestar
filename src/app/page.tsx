import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FACEBOOK_URL, TIKTOK_URL, WHATSAPP_URL } from "@/lib/constants";
import { IMAGES } from "@/lib/images";

export const metadata: Metadata = {
  title: "Quality Shangi Potato Seeds for Better Farming",
  description:
    "Get reliable Shangi potato seeds and practical potato farming information from Primestar Potato Seeds. Chat with us on WhatsApp today.",
};

const WHY_ITEMS = [
  {
    title: "Quality-Focused Seed Supply",
    body: "We focus on supplying Shangi potato seeds and are working to make quality seed access easier for farmers.",
    icon: "🌱",
  },
  {
    title: "Farmer Education",
    body: "Our Potato Farming Guide covers land preparation, planting, crop management, pests, diseases and harvesting.",
    icon: "📚",
  },
  {
    title: "Practical Farming Information",
    body: "Straightforward, practical guidance farmers can actually use in the field — not just theory.",
    icon: "🧑‍🌾",
  },
  {
    title: "Easy Access Through WhatsApp",
    body: "Reach Primestar directly on WhatsApp for questions about Shangi seeds and potato farming.",
    icon: "💬",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image
          src={IMAGES.heroFarmField}
          alt="Green potato farmland in Kenya"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/75 to-brand-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent" />

        <div className="container-page relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/25">
              🌾 Serving Kenyan Farmers Since 2019
            </span>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Quality Shangi Potato Seeds for Better Farming
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/85">
              Get reliable Shangi potato seeds and practical potato farming
              information from Primestar Potato Seeds.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton message="Hello Primestar, I am interested in Shangi potato seeds. Please give me more information.">
                Click to Chat With Us on WhatsApp +254728623619
              </WhatsAppButton>
              <Link
                href="/farming-guide"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white hover:text-brand-dark"
              >
                Learn How to Grow Potatoes
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-white/80">
              🌱 Helping farmers make better potato farming decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Why Primestar */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-brand-dark">
            Why Consider Primestar
          </h2>
          <p className="mt-3 text-brand-dark/70">
            We aim to help Kenyan farmers grow potatoes with more confidence
            through good seed and honest, practical information.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-brand-lighter bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-4 font-heading text-lg font-bold text-brand-dark">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-brand-dark/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shangi teaser */}
      <section className="bg-brand-lighter/60 py-16">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="order-2 rounded-3xl bg-white p-8 shadow-sm lg:order-1">
            <h2 className="font-heading text-2xl font-bold text-brand-dark sm:text-3xl">
              Shangi Potato Seeds
            </h2>
            <p className="mt-3 text-brand-dark/75">
              Shangi is a widely grown potato variety among Kenyan farmers.
              Explore our dedicated guide covering seed selection, land
              preparation, planting, spacing, crop management, pests, diseases,
              harvesting and storage.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shangi-seeds"
                className="rounded-full bg-brand-dark px-6 py-3 text-sm font-semibold text-white hover:bg-brand-medium"
              >
                Explore Shangi Seeds
              </Link>
              <WhatsAppButton
                variant="outline"
                className="!px-6 !py-3 text-sm"
                message="Hello Primestar, I am interested in Shangi potato seeds. Please give me more information."
              >
                Order Shangi Seeds
              </WhatsAppButton>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={IMAGES.freshPotatoesPile}
                alt="Freshly harvested potatoes"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Farmer engagement / guide teaser */}
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/farming-guide"
            className="group rounded-2xl border border-brand-lighter p-6 transition-colors hover:border-brand-medium"
          >
            <span className="text-2xl">📘</span>
            <h3 className="mt-3 font-heading text-lg font-bold text-brand-dark group-hover:text-brand-medium">
              Potato Farming Guide
            </h3>
            <p className="mt-2 text-sm text-brand-dark/70">
              Step-by-step articles from getting started to post-harvest.
            </p>
          </Link>
          <Link
            href="/calculator"
            className="group rounded-2xl border border-brand-lighter p-6 transition-colors hover:border-brand-medium"
          >
            <span className="text-2xl">🧮</span>
            <h3 className="mt-3 font-heading text-lg font-bold text-brand-dark group-hover:text-brand-medium">
              Farming Calculator
            </h3>
            <p className="mt-2 text-sm text-brand-dark/70">
              Estimate seed requirements and plan your farm budget.
            </p>
          </Link>
          <Link
            href="/blog"
            className="group rounded-2xl border border-brand-lighter p-6 transition-colors hover:border-brand-medium"
          >
            <span className="text-2xl">📰</span>
            <h3 className="mt-3 font-heading text-lg font-bold text-brand-dark group-hover:text-brand-medium">
              Farming Blog
            </h3>
            <p className="mt-2 text-sm text-brand-dark/70">
              Tips, market information and seasonal farming advice.
            </p>
          </Link>
        </div>
      </section>

      {/* Life on the farm — photo strip */}
      <section className="py-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            {
              src: IMAGES.potatoFieldRows,
              alt: "Rows of potato plants on the Primestar farm",
            },
            {
              src: IMAGES.handsWithPotatoes,
              alt: "Inspecting a seed potato's eyes and sprouts",
            },
            {
              src: IMAGES.seedSortingScale,
              alt: "Seed potatoes laid out for sorting",
            },
            {
              src: IMAGES.storeBags,
              alt: "Bagged seed at the Primestar store",
            },
          ].map((img) => (
            <div
              key={img.src}
              className="relative aspect-square overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Social / Follow Primestar */}
      <section className="bg-brand-dark py-16 text-white">
        <div className="container-page text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Follow Primestar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-cream/80">
            Stay connected with Primestar Potato Seeds for potato farming tips,
            seed information, farmer education, and updates.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20"
            >
              Facebook
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20"
            >
              TikTok
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1ebc59]"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
