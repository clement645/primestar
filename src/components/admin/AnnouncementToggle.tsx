"use client";

import { useTransition } from "react";
import { toggleAnnouncement } from "@/app/admin/settings/actions";

export default function AnnouncementToggle({
  id,
  status,
}: {
  id: string;
  status: "ACTIVE" | "INACTIVE";
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleAnnouncement(id))}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-brand-lighter text-brand-dark"
      }`}
    >
      {status === "ACTIVE" ? "Active — Click to Unpublish" : "Inactive — Click to Publish"}
    </button>
  );
}
