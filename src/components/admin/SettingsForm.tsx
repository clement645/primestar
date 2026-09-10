"use client";

import { useActionState } from "react";

export default function SettingsForm({
  action,
  children,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; ok?: boolean }, formData: FormData) => action(formData),
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {children}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
        {state?.ok && <span className="text-sm font-semibold text-green-700">Saved ✓</span>}
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
