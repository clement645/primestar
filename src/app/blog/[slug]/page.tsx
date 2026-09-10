import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import WhatsAppButton from "@/components/WhatsAppButton";

export const revalidate = 120;

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug, status: "PUBLISHED" } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { category: post.category, status: "PUBLISHED", NOT: { id: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-semibold text-brand-medium hover:underline">
          ← Back to Blog
        </Link>

        <span className="mt-4 block text-sm font-semibold uppercase tracking-wide text-brand-medium">
          {post.category}
        </span>
        <h1 className="mt-2 font-heading text-3xl font-extrabold text-brand-dark sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-brand-dark/60">
          <span>By {post.author}</span>
          <span aria-hidden="true">•</span>
          <span>
            {(post.publishedAt ?? post.createdAt).toLocaleDateString("en-KE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span aria-hidden="true">•</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <div className="mt-8 h-52 w-full rounded-2xl bg-gradient-to-br from-brand-lighter to-brand-earth/30" />

        <div className="prose prose-headings:font-heading prose-headings:text-brand-dark mt-8 max-w-none whitespace-pre-line text-brand-dark/80">
          {post.content}
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
                  href={`/blog/${r.slug}`}
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
            <WhatsAppButton message={`Hello Primestar, I have a question about: ${post.title}`}>
              Ask Primestar on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
