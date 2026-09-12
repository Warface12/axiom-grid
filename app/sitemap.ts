import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSitemapPlatforms } from "@/lib/platforms";
import { MARKET_POLICIES } from "@/lib/markets";
import { guides } from "@/lib/guides";
import { CATALOG, platformPath } from "@/lib/catalog";
import { PUBLIC_STATIC_PATHS } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = PUBLIC_STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" as const : "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
  const markets = MARKET_POLICIES.filter((m) => m.publicResearch).map((m) => ({
    url: `${SITE_URL}/markets/${m.code.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.62,
  }));
  const learn = guides.map((g) => ({
    url: `${SITE_URL}/learn/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));
  let platforms: Awaited<ReturnType<typeof getSitemapPlatforms>> = [];
  try {
    platforms = await getSitemapPlatforms();
  } catch {
    platforms = [];
  }
  const extraHubs = CATALOG.filter((cat) => !cat.dedicated).map((cat) => ({
    url: `${SITE_URL}/${cat.hub}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const dynamic = platforms.map((p) => ({
    url: `${SITE_URL}${platformPath(p.kind, p.slug)}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: p.featured ? 0.85 : 0.72,
  }));
  return [...base, ...markets, ...learn, ...extraHubs, ...dynamic];
}
