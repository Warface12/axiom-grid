import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSitemapPlatforms } from "@/lib/platforms";
import { MARKET_POLICIES } from "@/lib/markets";
import { guides } from "@/lib/guides";
import { CATALOG, platformPath } from "@/lib/catalog";

const STATIC = ["/", "/exchanges", "/brokers", "/wallets", "/research", "/updates", "/compare", "/learn", "/markets", "/fees", "/security", "/how-we-rate", "/editorial-policy", "/corrections", "/contact", "/legal/affiliate-disclosure", "/legal/risk-disclosure", "/legal/privacy", "/legal/cookies", "/legal/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = STATIC.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: path === "/" ? "daily" as const : "weekly" as const, priority: path === "/" ? 1 : .7 }));
  const markets = MARKET_POLICIES.filter((m) => m.publicResearch).map((m) => ({ url: `${SITE_URL}/markets/${m.code.toLowerCase()}`, lastModified: now, changeFrequency: "monthly" as const, priority: .62 }));
  const learn = guides.map((g) => ({ url: `${SITE_URL}/learn/${g.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: .55 }));
  const platforms = await getSitemapPlatforms();
  const extraHubs = CATALOG.filter((cat) => !cat.dedicated && platforms.some((p) => p.kind === cat.id)).map((cat) => ({
    url: `${SITE_URL}/${cat.hub}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: .6,
  }));
  const dynamic = platforms.map((p) => ({
    url: `${SITE_URL}${platformPath(p.kind, p.slug)}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: p.featured ? .85 : .72,
  }));
  return [...base, ...markets, ...learn, ...extraHubs, ...dynamic];
}
