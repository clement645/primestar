import type { Metadata } from "next";
import Image from "next/image";
import WhatsAppButton from "@/components/WhatsAppButton";
import { IMAGES } from "@/lib/images";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Primestar Potato Seeds — our mission, vision and what we offer Kenyan potato farmers since 2019.",
};

const FOUNDED_YEAR = 2019;

export default function AboutPage() {
  const yearsInOperation = new Date().getFullYear() - FOUNDED_YEAR;

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <Image
          src={IMAGES.aerialGreenField}
          alt="Aerial view of green farmland"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/70" />
        <div className="container-page relative py-16 text-center sm:py-24">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-light">
            About Primestar
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold text-white">
            Growing With Kenyan Farmers Since {FOUNDED_YEAR}
          </h1>
        </div>
      </section>

      <div className="container-page py-14">
        <div className="mx-auto max-w-3xl">
          <section>
            <h2 className="font-heading text-2xl font-bold text-brand-dark">Who We Are</h2>
            <p className="mt-3 text-brand-dark/75">
              Primestar Potato Seeds has been supplying Shangi potato seeds
              to farmers in Kenya and sharing practical potato farming
              information since {FOUNDED_YEAR} — {yearsInOperation} years of
              working alongside farmers who grow the crop we care about.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-brand-dark">Our Mission</h2>
            <p className="mt-3 text-brand-dark/75">
              To put reliable Shangi potato seed and clear, practical growing
              knowledge within easy reach of every Kenyan farmer — so that
              good information and good seed are never the reason a harvest
              falls short.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-brand-dark">Our Vision</h2>
            <p className="mt-3 text-brand-dark/75">
              A Kenya where every potato farmer, from a small kitchen-garden
              plot to a multi-acre farm, has the seed quality and farming
              knowledge to grow with confidence season after season.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-brand-dark">What We Offer</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-brand-dark/75">
              <li>Shangi potato seeds</li>
              <li>A comprehensive potato farming education center</li>
              <li>A farming blog with practical tips</li>
              <li>A potato farming calculator</li>
              <li>Direct WhatsApp support for farmer questions</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-brand-dark">
              Why Farmers Choose Us
            </h2>
            <p className="mt-3 text-brand-dark/75">
              Since {FOUNDED_YEAR}, we&apos;ve focused on quality seed supply,
              clear farmer education, and easy access through WhatsApp —
              principles we continue to build on with every planting season.
            </p>
          </section>

          <div className="mt-12 rounded-2xl bg-brand-lighter/60 p-8 text-center">
            <p className="font-heading text-xl font-bold text-brand-dark">
              Have a question about Primestar?
            </p>
            <div className="mt-5">
              <WhatsAppButton message="Hello Primestar, I would like to know more about your company.">
                Chat With Primestar
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
