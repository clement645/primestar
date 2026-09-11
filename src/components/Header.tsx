"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import WhatsAppButton from "@/components/WhatsAppButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/shangi-seeds", label: "Shangi Seeds" },
  { href: "/farming-guide", label: "Farming Guide" },
  { href: "/calculator", label: "Farming Calculator" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-lighter bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold text-brand-dark">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-brand-cream">
            🥔
          </span>
          <span className="hidden sm:inline">
            Primestar <span className="text-brand-medium">Potato Seeds</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-brand-medium ${
                pathname === link.href ? "text-brand-medium" : "text-brand-dark/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-brand-dark/80 hover:text-brand-medium"
              >
                {session.user?.name?.split(" ")[0] ?? "Dashboard"}
              </Link>
              <Link
                href="/account"
                className="text-sm font-semibold text-brand-dark/50 hover:text-brand-medium"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-semibold text-brand-dark/50 hover:text-red-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-brand-dark/80 hover:text-brand-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border-2 border-brand-dark px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-dark hover:text-white"
              >
                Register
              </Link>
            </>
          )}
          <WhatsAppButton
            variant="primary"
            className="!px-5 !py-2.5 text-sm"
            message="Hello Primestar, I am interested in Shangi potato seeds. Please give me more information."
          >
            WhatsApp Us
          </WhatsAppButton>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-lighter text-brand-dark lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-lighter bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-base font-medium ${
                  pathname === link.href
                    ? "bg-brand-lighter text-brand-dark"
                    : "text-brand-dark/80 hover:bg-brand-lighter/60"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 grid grid-cols-2 gap-2 px-3">
              {status === "authenticated" ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-full border-2 border-brand-dark px-4 py-2.5 text-center text-sm font-semibold text-brand-dark"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="rounded-full border-2 border-brand-lighter px-4 py-2.5 text-center text-sm font-semibold text-brand-dark"
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="col-span-2 rounded-full border-2 border-red-200 px-4 py-2.5 text-center text-sm font-semibold text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-full border-2 border-brand-dark px-4 py-2.5 text-center text-sm font-semibold text-brand-dark"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-brand-dark px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="mt-2 px-3">
              <WhatsAppButton
                variant="primary"
                className="w-full"
                message="Hello Primestar, I am interested in Shangi potato seeds. Please give me more information."
              >
                WhatsApp Us
              </WhatsAppButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
