import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./utils";

type SeoInput = {
  title?: string | null;
  description?: string | null;
  path?: string;
  ogImage?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
  keywords?: string[];
};

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const clamp = (value: string, max: number) => value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
const DEFAULT_DESCRIPTION = "Compare market-eligible casino reviews, current offers, payment details and responsible-gambling information with NivaroBet.";

function normalizeDescription(value?: string | null) {
  const base = clean(value || DEFAULT_DESCRIPTION);
  if (base.length >= 110) return clamp(base, 160);
  return clamp(`${base} Availability and promotions are shown only where market eligibility is confirmed.`, 160);
}

export function buildMetadata(input: SeoInput): Metadata {
  const title = clamp(clean(input.title || `${SITE_NAME} — Casino Reviews, Bonuses & Markets`), 62);
  const description = normalizeDescription(input.description);
  const path = input.path || "/";
  const url = new URL(path, SITE_URL).toString();
  const ogImage = input.ogImage || `${SITE_URL}/og-default.png`;

  return {
    title,
    description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: input.type || "website", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    robots: input.noIndex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export function organizationJsonLd() {
  return { "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } };
}

export function websiteJsonLd() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, publisher: { "@id": `${SITE_URL}/#organization` } };
}

export function webPageJsonLd(input: { name: string; description: string; path: string }) {
  return { "@context": "https://schema.org", "@type": "WebPage", name: input.name, description: input.description, url: new URL(input.path, SITE_URL).toString(), isPartOf: { "@id": `${SITE_URL}/#website` }, publisher: { "@id": `${SITE_URL}/#organization` } };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })) };
}

export function itemListJsonLd(items: { name: string; url: string }[]) {
  return { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: items.length, itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: item.url })) };
}

export function casinoReviewJsonLd(casino: { name: string; slug: string; description: string | null; rating: number; logo_url: string | null }) {
  return { "@context": "https://schema.org", "@type": "Review", itemReviewed: { "@type": "Organization", name: casino.name, image: casino.logo_url || undefined, url: `${SITE_URL}/casinos/${casino.slug}` }, reviewRating: { "@type": "Rating", ratingValue: casino.rating, bestRating: 10, worstRating: 0 }, author: { "@id": `${SITE_URL}/#organization` }, reviewBody: casino.description || `${casino.name} casino review on ${SITE_NAME}.` };
}

export function articleJsonLd(guide: { title: string; slug: string; excerpt: string | null; featured_image_url: string | null; published_at: string | null }) {
  return { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.excerpt, image: guide.featured_image_url || undefined, mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`, datePublished: guide.published_at || undefined, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` } };
}
