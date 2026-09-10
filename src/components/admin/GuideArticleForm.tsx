"use client";

import { useActionState } from "react";
import { saveGuideArticle } from "@/app/admin/content/actions";
import type { GuideArticle } from "@prisma/client";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none";
const labelClass = "text-sm font-semibold text-brand-dark";

const SECTIONS = [
  { value: "getting-started", label: "Getting Started" },
  { value: "crop-management", label: "Crop Management" },
  { value: "pests-diseases", label: "Pests and Diseases" },
  { value: "harvest-post-harvest", label: "Harvest and Post-Harvest" },
];

export default function GuideArticleForm({ article }: { article?: GuideArticle }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) =>
      saveGuideArticle(article?.id ?? null, formData),
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <input name="title" required defaultValue={article?.title} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Section</label>
        <select name="section" defaultValue={article?.section ?? SECTIONS[0].value} className={inputClass}>
          {SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Content</label>
        <textarea name="content" required defaultValue={article?.content} rows={12} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select name="status" defaultValue={article?.status ?? "PUBLISHED"} className={inputClass}>
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
        {pending ? "Saving..." : "Save Article"}
      </button>
    </form>
  );
}
