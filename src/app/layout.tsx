import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyWhatsApp from "@/components/StickyWhatsApp";
import Providers from "@/components/Providers";
import { FACEBOOK_URL, TIKTOK_URL, WHATSAPP_URL } from "@/lib/constants";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const headingFont = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Primestar Potato Seeds | Quality Shangi Potato Seeds Kenya",
    template: "%s | Primestar Potato Seeds",
  },
  description:
    "Quality Shangi potato seeds and practical potato farming guidance for Kenyan farmers. Chat with Primestar on WhatsApp.",
  openGraph: {
    siteName: "Primestar Potato Seeds",
    type: "website",
    locale: "en_KE",
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Primestar Potato Seeds",
  url: siteUrl,
  description:
    "Quality potato seed information and practical farming knowledge for farmers.",
  sameAs: [FACEBOOK_URL, TIKTOK_URL],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: WHATSAPP_URL,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground pb-16 lg:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <StickyWhatsApp />
        </Providers>
      </body>
    </html>
  );
}
