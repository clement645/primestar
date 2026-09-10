"use client";

import { useState, useTransition } from "react";
import { toggleWorkerStatus, resetWorkerAccess } from "@/app/admin/workers/actions";

export default function WorkerRowActions({
  workerId,
  status,
  referralUrl,
}: {
  workerId: string;
  status: "ACTIVE" | "DISABLED";
  referralUrl: string;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // clipboard unavailable
          }
        }}
        className="rounded-full bg-brand-lighter px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-lighter/70"
      >
        {copied ? "Copied ✓" : "Copy Link"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleWorkerStatus(workerId))}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          status === "ACTIVE"
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        {status === "ACTIVE" ? "Disable" : "Reactivate"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await resetWorkerAccess(workerId);
            if (res.tempPassword) setTempPassword(res.tempPassword);
          })
        }
        className="rounded-full bg-brand-lighter px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-lighter/70"
      >
        Reset Access
      </button>
      {tempPassword && (
        <span className="rounded-full bg-brand-amber/20 px-3 py-1.5 text-xs font-semibold text-brand-earth">
          New temp password: {tempPassword}
        </span>
      )}
    </div>
  );
}
