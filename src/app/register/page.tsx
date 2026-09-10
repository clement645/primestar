"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, identifier, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { identifier, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      router.push("/login");
      return;
    }
    router.push("/farmer/dashboard");
    router.refresh();
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-sm rounded-2xl border border-brand-lighter bg-white p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-bold text-brand-dark">
          Create a Farmer Account
        </h1>
        <p className="mt-1 text-sm text-brand-dark/60">
          Optional — save your location, get weather alerts, crop reminders
          and calculator history. You can still browse and contact us on
          WhatsApp without an account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-brand-dark">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-dark">
              Email or phone number
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-dark">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-3 text-base focus:border-brand-medium focus:outline-none"
            />
            <p className="mt-1 text-xs text-brand-dark/50">At least 8 characters.</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-dark px-6 py-3 text-sm font-semibold text-white hover:bg-brand-medium disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-brand-dark/60">
          Already have an account? {" "}
          <a href="/login" className="font-semibold text-brand-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
