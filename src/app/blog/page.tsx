import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Potato farming tips, seed information, crop management, pest & disease guidance and market information for Kenyan farmers.",
};

export const revalidate = 120;

const CATEGORIES = [
  "Potato Farming",
  "Seeds",
  "Crop Management",
  "Pest & Disease",
  "Harvesting",
  "Farmer Tips",
  "Market Information",
];

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const where: Prisma.BlogPostWhereInput = { status: "PUBLISHED" };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container-page py-14">
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-medium">
          Knowledge Center
        </span>
        <h1 className="mt-2 font-heading text-4xl font-extrabold text-brand-dark">
          Farming Blog
        </h1>
      </div>

      <form className="mx-auto mt-8 flex max-w-xl gap-2" action="/blog" method="get">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search articles..."
          className="w-full rounded-full border border-brand-lighter px-5 py-3 text-sm focus:border-brand-medium focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-dark px-6 py-3 text-sm font-semibold text-white hover:bg-brand-medium"
        >
          Search
        </button>
      </form>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
        <Link
          href={q ? `/blog?q=${encodeURIComponent(q)}` : "/blog"}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !category ? "bg-brand-dark text-white" : "bg-brand-lighter text-brand-dark"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/blog?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              category === c ? "bg-brand-dark text-white" : "bg-brand-lighter text-brand-dark"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-brand-lighter bg-white p-5 shadow-sm hover:shadow-md"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-medium">
              {post.category}
            </span>
            <h2 className="mt-2 font-heading text-lg font-bold text-brand-dark group-hover:text-brand-medium">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-brand-dark/70">{post.excerpt}</p>
            <span className="mt-3 text-xs text-brand-dark/50">
              {post.readingMinutes} min read
            </span>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="col-span-full text-center text-brand-dark/60">
            No articles found. Try a different search or category.
          </p>
        )}
      </div>
    </div>
  );
}
