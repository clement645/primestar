import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import WhatsAppButton from "@/components/WhatsAppButton";
import { IMAGES } from "@/lib/images";

export const metadata: Metadata = {
  title: "Potato Farming Guide Kenya",
  description:
    "A complete potato farming guide for Kenyan farmers — getting started, crop management, pests & diseases, and harvest & post-harvest.",
};

const SECTIONS = [
  { key: "getting-started", label: "Getting Started" },
  { key: "crop-management", label: "Crop Management" },
  { key: "pests-diseases", label: "Pests and Diseases" },
  { key: "harvest-post-harvest", label: "Harvest and Post-Harvest" },
];

export const revalidate = 300;

export default async function FarmingGuidePage() {
  const articles = await prisma.guideArticle.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ section: "asc" }, { orderIndex: "asc" }],
  });

  const bySection = SECTIONS.map((section) => ({
    ...section,
    articles: articles.filter((a) => a.section === section.key),
  }));

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <Image
          src={IMAGES.potatoFieldRows}
          alt="Rows of potato plants in the field"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/75" />
        <div className="container-page relative py-16 text-center text-white sm:py-24">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-light">
            Farmer Education Center
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold text-white">
            Potato Farming Guide
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">
            Practical, easy-to-read articles covering every stage of potato
            farming — from getting started to preparing your harvest for
            market.
          </p>
        </div>
      </section>

      <div className="container-page space-y-14 py-14">
        {bySection.map((section) => (
          <section key={section.key}>
            <h2 className="font-heading text-2xl font-bold text-brand-dark">
              {section.label}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/farming-guide/${article.slug}`}
                  className="group flex flex-col rounded-2xl border border-brand-lighter bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-medium">
                    {section.label}
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-bold text-brand-dark group-hover:text-brand-medium">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-brand-dark/70">
                    {article.excerpt}
                  </p>
                  <span className="mt-3 text-xs text-brand-dark/50">
                    {article.readingMinutes} min read
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-2xl bg-brand-dark p-8 text-center text-white">
          <p className="font-heading text-xl font-bold">
            Have a question about potato farming?
          </p>
          <div className="mt-5 flex justify-center">
            <WhatsAppButton message="Hello Primestar, I have a question about potato farming.">
              Ask Primestar on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
