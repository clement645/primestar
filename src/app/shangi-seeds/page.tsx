import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "@/components/WhatsAppButton";
import { IMAGES } from "@/lib/images";

export const metadata: Metadata = {
  title: "Shangi Potato Seeds Kenya | Seed Selection, Planting & Care Guide",
  description:
    "Everything Kenyan farmers need to know about Shangi potato seeds — selection, land preparation, planting, spacing, crop management, pests, diseases, harvesting and storage.",
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Shangi Overview",
    body: (
      <p>
        Shangi is a widely grown potato variety among Kenyan farmers,
        recognised for its adaptability across several potato-growing
        regions. Chat with us on WhatsApp for variety-specific details for
        your area.
      </p>
    ),
  },
  {
    title: "Seed Selection",
    body: (
      <p>
        Choose seed tubers that are firm, free from visible rot, and of
        medium size for the best planting positions. Avoid seed with signs of
        disease, soft spots, or excessive sprouting damage.
      </p>
    ),
  },
  {
    title: "Land Preparation",
    body: (
      <p>
        Prepare land early by ploughing and harrowing to achieve a fine,
        well-drained seedbed. Good land preparation supports even
        emergence and healthy root development.
      </p>
    ),
  },
  {
    title: "Planting",
    body: (
      <p>
        Plant seed tubers at a consistent depth in moist soil. Avoid planting
        in waterlogged conditions, which can encourage tuber rot.
      </p>
    ),
  },
  {
    title: "Spacing",
    body: (
      <p>
        Consistent row and in-row spacing supports healthy plant development
        and easier field operations. Use our{" "}
        <a href="/calculator" className="font-semibold text-brand-medium underline">
          Farming Calculator
        </a>{" "}
        to estimate planting positions for your chosen spacing.
      </p>
    ),
  },
  {
    title: "Fertilizer Considerations",
    body: (
      <p>
        Potatoes generally benefit from balanced nutrition at planting and
        during early growth. Product choice and rates vary by soil and
        location, so always follow the approved product label and speak
        with a qualified agricultural officer, or ask us on WhatsApp for
        general guidance.
      </p>
    ),
  },
  {
    title: "Manure Considerations",
    body: (
      <p>
        Well-decomposed manure can improve soil structure and fertility when
        incorporated ahead of planting. Avoid fresh, undecomposed manure
        close to planting time.
      </p>
    ),
  },
  {
    title: "Weed Management",
    body: (
      <p>
        Early and consistent weeding reduces competition for nutrients,
        water and light. Combine timely hand-weeding or approved herbicide
        use with earthing up for better results.
      </p>
    ),
  },
  {
    title: "Water Management",
    body: (
      <p>
        Potatoes need consistent moisture, particularly during tuber
        initiation and bulking. Avoid both drought stress and waterlogging.
      </p>
    ),
  },
  {
    title: "Earthing Up",
    body: (
      <p>
        Earthing up covers developing tubers with soil, protecting them from
        sunlight (greening) and supporting stronger stems. It is typically
        done in stages as the crop grows.
      </p>
    ),
  },
  {
    title: "Pest Management",
    body: (
      <p>
        Common potato pests include aphids, cutworms, and potato tuber moth.
        Monitor fields regularly and follow approved product labels or seek
        qualified agricultural advice for control measures.
      </p>
    ),
  },
  {
    title: "Disease Management",
    body: (
      <p>
        Early blight and late blight are common potato diseases. Field
        monitoring, crop rotation and approved fungicide programs (where
        appropriate) can help manage disease pressure. Seek qualified
        agricultural advice for your specific situation.
      </p>
    ),
  },
  {
    title: "Harvesting",
    body: (
      <p>
        Harvest once the crop reaches maturity, generally indicated by
        haulm die-back. Handle tubers carefully to minimise bruising.
      </p>
    ),
  },
  {
    title: "Storage",
    body: (
      <p>
        Store harvested potatoes in a cool, dark, well-ventilated place to
        reduce sprouting and spoilage. Sort out damaged or diseased tubers
        before storage.
      </p>
    ),
  },
  {
    title: "Common Farming Mistakes",
    body: (
      <ul className="list-inside list-disc space-y-1">
        <li>Using poor-quality or diseased seed</li>
        <li>Inconsistent spacing leading to overcrowding</li>
        <li>Delayed weeding and earthing up</li>
        <li>Ignoring early signs of pests or disease</li>
        <li>Harvesting too early or too late</li>
        <li>Poor post-harvest handling and storage</li>
      </ul>
    ),
  },
];

export default function ShangiSeedsPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <Image
          src={IMAGES.freshPotatoesPile}
          alt="Freshly dug potatoes"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/75" />
        <div className="container-page relative py-16 text-center sm:py-24">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-light">
            Our Seed Variety
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold text-white">
            Shangi Potato Seeds
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">
            A complete practical guide to growing Shangi potatoes — from seed
            selection through to storage.
          </p>
          <div className="mt-6 flex justify-center">
            <WhatsAppButton message="Hello Primestar, I am interested in Shangi potato seeds. Please give me more information.">
              Order Shangi Seeds
            </WhatsAppButton>
          </div>
        </div>
      </section>

      <div className="container-page py-14">
        <div className="mx-auto max-w-3xl space-y-10">
          <Link
            href="/farming-guide/primestar-s-tested-one-acre-potato-farming-procedure"
            className="block rounded-2xl border-2 border-brand-medium bg-brand-lighter/50 p-6 transition-colors hover:bg-brand-lighter/80"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-medium">
              ✅ Signed &amp; Approved by Primestar
            </span>
            <h2 className="mt-1 font-heading text-xl font-bold text-brand-dark">
              Primestar&apos;s Tested One-Acre Potato Farming Procedure
            </h2>
            <p className="mt-2 text-sm text-brand-dark/70">
              Our own field-tested, step-by-step procedure — furrow width,
              seed spacing, fertilizer rates, earthing-up timing, and our
              recommended fungicide program by season. Read the full
              procedure →
            </p>
          </Link>

          {SECTIONS.map((section, i) => (
            <section key={section.title}>
              <h2 className="font-heading text-2xl font-bold text-brand-dark">
                {i + 1}. {section.title}
              </h2>
              <div className="mt-3 space-y-2 text-brand-dark/75">{section.body}</div>
            </section>
          ))}

          <div className="rounded-2xl bg-brand-dark p-8 text-center text-white">
            <p className="font-heading text-xl font-bold">
              Interested in Shangi Potato Seeds?
            </p>
            <p className="mt-2 text-brand-cream/80">
              Chat with Primestar directly on WhatsApp for more information.
            </p>
            <div className="mt-5 flex justify-center">
              <WhatsAppButton message="Hello Primestar, I am interested in Shangi potato seeds. Please give me more information.">
                Chat With Primestar
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
