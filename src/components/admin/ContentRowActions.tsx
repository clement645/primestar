"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ContentRowActions({
  editHref,
  status,
  onToggle,
  onDelete,
}: {
  editHref: string;
  status: "DRAFT" | "PUBLISHED";
  onToggle: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => router.push(editHref)}
        className="rounded-full bg-brand-lighter px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-lighter/70"
      >
        Edit
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(onToggle)}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          status === "PUBLISHED" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
        }`}
      >
        {status === "PUBLISHED" ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this permanently? This cannot be undone.")) {
            startTransition(onDelete);
          }
        }}
        className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
      >
        Delete
      </button>
    </div>
  );
}
