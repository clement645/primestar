import type { Metadata } from "next";
import { FACEBOOK_URL, TIKTOK_URL } from "@/lib/constants";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Primestar Potato Seeds on WhatsApp, Facebook or TikTok for Shangi potato seed information.",
};

export default function ContactPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-medium">
          Get in Touch
        </span>
        <h1 className="mt-2 font-heading text-4xl font-extrabold text-brand-dark">
          Primestar Potato Seeds
        </h1>
        <p className="mt-4 text-brand-dark/75">
          The fastest way to reach us is on WhatsApp. Chat with us about
          Shangi potato seeds, farming questions, or general inquiries.
        </p>
        <div className="mt-6 flex justify-center">
          <WhatsAppButton message="Hello Primestar, I would like to get in touch.">
            Chat With Us on WhatsApp
          </WhatsAppButton>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-lighter p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-medium">
              WhatsApp
            </p>
            <p className="mt-1 font-semibold text-brand-dark">0728 623 619</p>
          </div>
          <div className="rounded-2xl border border-brand-lighter p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-medium">
              Email
            </p>
            <p className="mt-1 text-brand-dark/70">
              Reach us fastest on WhatsApp
            </p>
          </div>
          <div className="rounded-2xl border border-brand-lighter p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-medium">
              Coverage
            </p>
            <p className="mt-1 text-brand-dark/70">
              Serving potato farmers across Kenya
            </p>
          </div>
          <div className="rounded-2xl border border-brand-lighter p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-medium">
              Availability
            </p>
            <p className="mt-1 text-brand-dark/70">
              Message us on WhatsApp any time — we respond as soon as we can
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-lighter px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-lighter/70"
          >
            Facebook
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-lighter px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-lighter/70"
          >
            TikTok
          </a>
        </div>
      </div>
    </div>
  );
}
