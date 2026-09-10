"use client";

import { useActionState } from "react";
import { createWorker } from "@/app/admin/workers/actions";

const initialState: { error?: string } = {};

export default function CreateWorkerForm() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    return createWorker(formData);
  }, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-4">
      <input
        name="name"
        required
        placeholder="Full name"
        className="rounded-lg border border-brand-lighter px-3 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="rounded-lg border border-brand-lighter px-3 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
      />
      <input
        name="referralCode"
        required
        placeholder="Referral code e.g. JANE04"
        className="rounded-lg border border-brand-lighter px-3 py-2.5 text-sm uppercase focus:border-brand-medium focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add Worker"}
      </button>
      {state?.error && (
        <p className="sm:col-span-4 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
