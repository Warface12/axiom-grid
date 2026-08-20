import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "NivaroBet — Casino Reviews, Bonuses & Markets",
    description: "NivaroBet is a casino discovery, bonus comparison and market guide with monitored partner information.",
    path: "/",
  }),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

const SUPPORTED_HTML_LANGS = new Set(["en","da","de","fr","es","it","nl","pt","no","fi","sv"]);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const requestedLang = (h.get("x-nivaro-lang") || "en").toLowerCase();
  const htmlLang = SUPPORTED_HTML_LANGS.has(requestedLang) ? requestedLang : "en";
  return (
    <html lang={htmlLang} data-theme="dark">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      </head>
      <body>
        <Header />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
