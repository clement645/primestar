"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-brand-dark">Current password</label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-brand-dark">New password</label>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
        />
        <p className="mt-1 text-xs text-brand-dark/50">At least 8 characters.</p>
      </div>
      <div>
        <label className="text-sm font-semibold text-brand-dark">Confirm new password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-brand-lighter px-4 py-2.5 text-sm focus:border-brand-medium focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm font-semibold text-green-700">Password updated ✓</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
