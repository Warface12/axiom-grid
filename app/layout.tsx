import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import "./theme.css";
import "./public-ux.css";
import "./visual-system.css";
import "./experience.css";
import "./readability.css";
import "./atelier.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { PwaRegister } from "@/components/PwaRegister";
import { AppDock } from "@/components/AppDock";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

const display = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const body = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  ...buildMetadata({
    title: "TopPick.pro — Compare crypto platforms, wallets and brokers",
    description: "Independent research for crypto exchanges, wallets, brokers and trading tools. Discover, compare and understand products before you act.",
    path: "/",
  }),
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  icons: { icon: [{ url: "/toppick-mark.svg", type: "image/svg+xml" }], apple: "/toppick-mark.svg" },
  category: "finance",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "TopPick", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0907" },
    { media: "(prefers-color-scheme: light)", color: "#f3ead8" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-scheme="dark" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
        <link rel="apple-touch-icon" href="/toppick-mark.svg" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        <div id="main-content">{children}</div>
        <Footer />
        <AppDock />
        <Analytics />
        <PwaRegister />
      </body>
    </html>
  );
}
