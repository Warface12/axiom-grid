import { CATALOG } from "@/lib/catalog";

type PlatformRow = {
  kind?: string | null;
  visible?: boolean | null;
  featured?: boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
  affiliate_url?: string | null;
  verification_status?: string | null;
};

type MarketRow = {
  status?: string | null;
  commercial_allowed?: boolean | null;
  expires_at?: string | null;
};

export function computeAdminKpis(platforms: PlatformRow[], markets: MarketRow[], clicks: number) {
  const now = Date.now();
  const byKind = Object.fromEntries(CATALOG.map((c) => [c.id, platforms.filter((p) => p.kind === c.id).length]));
  return {
    platforms: platforms.length,
    visible: platforms.filter((p) => p.visible).length,
    drafts: platforms.filter((p) => !p.visible).length,
    featured: platforms.filter((p) => p.featured).length,
    byKind,
    marketRules: markets.length,
    commercialOpen: markets.filter((r) => r.commercial_allowed && r.status === "approved").length,
    expiredRules: markets.filter((r) => r.expires_at && new Date(r.expires_at).getTime() < now).length,
    missingSeo: platforms.filter((p) => !p.seo_title || !p.seo_description).length,
    missingAffiliate: platforms.filter((p) => p.visible && !p.affiliate_url).length,
    needsReview: platforms.filter((p) => {
      const v = String(p.verification_status || "needs_review");
      return v === "needs_review" || v === "imported" || v === "stale" || v === "missing";
    }).length,
    clicks,
  };
}
