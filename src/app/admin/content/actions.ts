"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/authz";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const blogSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.string().min(2).max(60),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10),
  featuredImage: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(300).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function saveBlogPost(id: string | null, formData: FormData): Promise<{ error?: string }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const parsed = blogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the form fields." };
  const data = parsed.data;

  const slug = slugify(data.title);
  const payload = {
    title: data.title,
    slug,
    category: data.category,
    excerpt: data.excerpt || data.content.slice(0, 160),
    content: data.content,
    featuredImage: data.featuredImage || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    readingMinutes: readingMinutes(data.content),
    status: data.status,
    publishedAt: data.status === "PUBLISHED" ? new Date() : null,
  };

  if (id) {
    await prisma.blogPost.update({ where: { id }, data: payload });
  } else {
    await prisma.blogPost.create({ data: payload });
  }

  revalidatePath("/admin/content");
  revalidatePath("/blog");
  redirect("/admin/content");
}

export async function deleteBlogPost(id: string): Promise<void> {
  const session = await requireRole("ADMIN");
  if (!session) return;
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/blog");
}

export async function togglePublishBlogPost(id: string): Promise<void> {
  const session = await requireRole("ADMIN");
  if (!session) return;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;
  const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.blogPost.update({
    where: { id },
    data: { status: nextStatus, publishedAt: nextStatus === "PUBLISHED" ? new Date() : post.publishedAt },
  });
  revalidatePath("/admin/content");
  revalidatePath("/blog");
}

const guideSchema = z.object({
  title: z.string().min(3).max(200),
  section: z.enum(["getting-started", "crop-management", "pests-diseases", "harvest-post-harvest"]),
  content: z.string().min(10),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function saveGuideArticle(id: string | null, formData: FormData): Promise<{ error?: string }> {
  const session = await requireRole("ADMIN");
  if (!session) return { error: "Unauthorized" };

  const parsed = guideSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the form fields." };
  const data = parsed.data;
  const slug = slugify(data.title);

  const payload = {
    title: data.title,
    slug,
    section: data.section,
    content: data.content,
    excerpt: data.content.slice(0, 160),
    readingMinutes: readingMinutes(data.content),
    status: data.status,
    publishedAt: data.status === "PUBLISHED" ? new Date() : null,
  };

  if (id) {
    await prisma.guideArticle.update({ where: { id }, data: payload });
  } else {
    await prisma.guideArticle.create({ data: payload });
  }

  revalidatePath("/admin/content");
  revalidatePath("/farming-guide");
  redirect("/admin/content");
}

export async function deleteGuideArticle(id: string): Promise<void> {
  const session = await requireRole("ADMIN");
  if (!session) return;
  await prisma.guideArticle.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/farming-guide");
}

export async function togglePublishGuideArticle(id: string): Promise<void> {
  const session = await requireRole("ADMIN");
  if (!session) return;
  const article = await prisma.guideArticle.findUnique({ where: { id } });
  if (!article) return;
  const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.guideArticle.update({
    where: { id },
    data: { status: nextStatus, publishedAt: nextStatus === "PUBLISHED" ? new Date() : article.publishedAt },
  });
  revalidatePath("/admin/content");
  revalidatePath("/farming-guide");
}
