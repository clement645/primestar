"use client";

import { useActionState } from "react";
import { saveBlogPost } from "@/app/admin/content/actions";
import type { BlogPost } from "@prisma/client";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none";
const labelClass = "text-sm font-semibold text-brand-dark";

const CATEGORIES = [
  "Potato Farming",
  "Seeds",
  "Crop Management",
  "Pest & Disease",
  "Harvesting",
  "Farmer Tips",
  "Market Information",
];

export default function BlogPostForm({ post }: { post?: BlogPost }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) =>
      saveBlogPost(post?.id ?? null, formData),
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <input name="title" required defaultValue={post?.title} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={post?.category ?? CATEGORIES[0]} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Featured Image URL (optional)</label>
          <input name="featuredImage" defaultValue={post?.featuredImage ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Excerpt (optional)</label>
        <textarea name="excerpt" defaultValue={post?.excerpt ?? ""} rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Content</label>
        <textarea name="content" required defaultValue={post?.content} rows={12} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>SEO Title (optional)</label>
          <input name="seoTitle" defaultValue={post?.seoTitle ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SEO Description (optional)</label>
          <input name="seoDescription" defaultValue={post?.seoDescription ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select name="status" defaultValue={post?.status ?? "DRAFT"} className={inputClass}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Post"}
      </button>
    </form>
  );
}
