"use client";

import { usePathname } from "next/navigation";
import { whatsappUrl } from "@/lib/constants";

interface WhatsAppButtonProps {
  message?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-[#25D366] hover:bg-[#1ebc59] text-white shadow-lg shadow-green-900/10",
  secondary: "bg-brand-dark hover:bg-brand-medium text-white",
  outline:
    "border-2 border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 bg-transparent",
};

/**
 * Renders a real <a href="https://wa.me/..."> link (works with JS disabled,
 * good for SEO/crawlers) that also fires a fire-and-forget beacon to record
 * a WhatsApp Click conversion before the browser navigates away.
 */
export default function WhatsAppButton({
  message,
  children,
  className = "",
  variant = "primary",
}: WhatsAppButtonProps) {
  const pathname = usePathname();

  function recordClick() {
    try {
      const payload = JSON.stringify({ page: pathname });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/whatsapp/click", blob);
      } else {
        fetch("/api/whatsapp/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    } catch {
      // Tracking must never block the customer from reaching WhatsApp.
    }
  }

  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={recordClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-base transition-colors duration-150 active:scale-[0.98] ${variantClasses[variant]} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm5.8 14.19c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.93.28.14.47.21.53.33.07.13.07.72-.17 1.4z" />
      </svg>
      {children}
    </a>
  );
}
