import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes = [
    "",
    "/about",
    "/shangi-seeds",
    "/farming-guide",
    "/calculator",
    "/blog",
    "/contact",
    "/privacy-policy",
    "/terms-of-use",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const [articles, posts] = await Promise.all([
    prisma.guideArticle.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const guideRoutes = articles.map((a) => ({
    url: `${siteUrl}/farming-guide/${a.slug}`,
    lastModified: a.updatedAt,
  }));

  const blogRoutes = posts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...guideRoutes, ...blogRoutes];
}
