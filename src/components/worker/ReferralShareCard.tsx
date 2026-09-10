"use client";

import { useState } from "react";

export default function ReferralShareCard({ referralUrl }: { referralUrl: string }) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Looking for quality Shangi potato seeds and practical potato farming information? Check out Primestar Potato Seeds: ${referralUrl}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard may be unavailable in some browser contexts
    }
  }

  async function shareGeneric() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Primestar Potato Seeds", text: shareMessage, url: referralUrl });
      } catch {
        // user cancelled — no action needed
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="rounded-2xl border border-brand-lighter bg-white p-6">
      <p className="text-sm font-semibold text-brand-dark">Your Referral Link</p>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-brand-lighter/60 px-4 py-3">
        <code className="flex-1 truncate text-sm text-brand-dark">{referralUrl}</code>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium"
        >
          {copied ? "Copied ✓" : "Copy Link"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebc59]"
        >
          Share on WhatsApp
        </a>
        <button
          type="button"
          onClick={shareGeneric}
          className="rounded-full border-2 border-brand-dark px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand-dark hover:text-white"
        >
          Share
        </button>
      </div>
    </div>
  );
}
