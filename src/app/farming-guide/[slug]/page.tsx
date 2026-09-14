import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSectionImage } from "@/lib/images";
import WhatsAppButton from "@/components/WhatsAppButton";

const SECTION_LABELS: Record<string, string> = {
  "getting-started": "Getting Started",
  "crop-management": "Crop Management",
  "pests-diseases": "Pests and Diseases",
  "harvest-post-harvest": "Harvest and Post-Harvest",
};

export const revalidate = 300;

async function getArticle(slug: string) {
  return prisma.guideArticle.findUnique({ where: { slug, status: "PUBLISHED" } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? undefined,
  };
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await prisma.guideArticle.findMany({
    where: { section: article.section, status: "PUBLISHED", NOT: { id: article.id } },
    orderBy: { orderIndex: "asc" },
    take: 3,
  });

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/farming-guide" className="text-sm font-semibold text-brand-medium hover:underline">
          ← Back to Farming Guide
        </Link>

        <span className="mt-4 block text-sm font-semibold uppercase tracking-wide text-brand-medium">
          {SECTION_LABELS[article.section] ?? article.section}
        </span>
        <h1 className="mt-2 font-heading text-3xl font-extrabold text-brand-dark sm:text-4xl">
          {article.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-brand-dark/60">
          <span>By {article.author}</span>
          <span aria-hidden="true">•</span>
          <span>
            {(article.publishedAt ?? article.createdAt).toLocaleDateString("en-KE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span aria-hidden="true">•</span>
          <span>{article.readingMinutes} min read</span>
        </div>

        <div className="relative mt-8 h-52 w-full overflow-hidden rounded-2xl">
          <Image
            src={article.featuredImage || getSectionImage(article.section)}
            alt={article.title}
            fill
            sizes="(min-width: 768px) 700px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="prose prose-headings:font-heading prose-headings:text-brand-dark mt-8 max-w-none whitespace-pre-line text-brand-dark/80">
          {article.content}
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-xl font-bold text-brand-dark">
              Related Articles
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/farming-guide/${r.slug}`}
                  className="rounded-xl border border-brand-lighter p-4 text-sm font-semibold text-brand-dark hover:border-brand-medium hover:text-brand-medium"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-brand-lighter/60 p-8 text-center">
          <p className="font-heading text-xl font-bold text-brand-dark">
            Have a question about potato farming?
          </p>
          <div className="mt-5 flex justify-center">
            <WhatsAppButton message={`Hello Primestar, I have a question about: ${article.title}`}>
              Ask Primestar on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
