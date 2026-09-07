import { createClient } from "@supabase/supabase-js";
import type { Platform, PlatformKind, PlatformStatus, VerificationState } from "@/lib/types";
import { isPlatformKind, platformPath } from "@/lib/catalog";
import { visiblePlatformIdsForVisitor, platformMarketDecision, visitorMarketContext } from "@/lib/marketVisibility";

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function asKind(value: unknown): PlatformKind {
  return isPlatformKind(String(value)) ? String(value) as PlatformKind : "exchange";
}

export function mapPlatformRow(row: Record<string, unknown>): Platform {
  const kind = asKind(row.kind);
  const status = (["research", "verified", "restricted"].includes(String(row.status)) ? row.status : "research") as PlatformStatus;
  const attrs = row.attributes && typeof row.attributes === "object" && !Array.isArray(row.attributes)
    ? row.attributes as Record<string, string | boolean | null>
    : {};
  const short = String(row.short_description || "").trim();
  const description = String(row.full_review || row.short_description || "").trim();
  const updated = row.updated_at ? new Date(String(row.updated_at)).toISOString().slice(0, 10) : "";
  return {
    id: row.id ? String(row.id) : undefined,
    slug: String(row.slug || ""),
    name: String(row.name || ""),
    short,
    description,
    kind,
    status,
    logoText: String(row.name || "TP").slice(0, 2).toUpperCase(),
    logoUrl: row.logo_url ? String(row.logo_url) : null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    updatedAt: updated,
    website: row.official_url ? String(row.official_url) : "",
    affiliateUrl: row.affiliate_url ? String(row.affiliate_url) : null,
    custody: row.custody_model ? String(row.custody_model) : null,
    markets: [],
    productNote: String(row.regulatory_summary || "").trim(),
    feeSummary: row.fee_summary ? String(row.fee_summary) : null,
    securitySummary: row.security_summary ? String(row.security_summary) : null,
    regulatorySummary: row.regulatory_summary ? String(row.regulatory_summary) : null,
    productSummary: row.product_summary ? String(row.product_summary) : null,
    pros: Array.isArray(row.pros) ? row.pros.map(String) : [],
    cons: Array.isArray(row.cons) ? row.cons.map(String) : [],
    featured: Boolean(row.featured),
    visible: Boolean(row.visible),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    subcategory: row.subcategory ? String(row.subcategory) : null,
    attributes: attrs,
    verificationStatus: (["needs_review", "imported", "manual", "verified", "stale", "missing"].includes(String(row.verification_status))
      ? row.verification_status
      : "needs_review") as VerificationState,
    lastVerifiedAt: row.last_verified_at ? String(row.last_verified_at) : null,
    operatorName: row.operator_name ? String(row.operator_name) : null,
    foundedYear: typeof row.founded_year === "number" ? row.founded_year : null,
    editorialScore: (() => {
      const n = Number(row.editorial_score);
      return Number.isFinite(n) ? n : null;
    })(),
    archived: Boolean(row.archived),
    coverUrl: row.cover_url ? String(row.cover_url) : null,
    languages: Array.isArray(row.languages) ? row.languages.map(String) : [],
  };
}

export function hrefFor(platform: Pick<Platform, "kind" | "slug">) {
  return platformPath(platform.kind, platform.slug);
}

export async function getPublicPlatforms(kind?: PlatformKind, limit = 100): Promise<Platform[]> {
  const supabase = serverClient();
  if (!supabase) return [];
  const { ids } = await visiblePlatformIdsForVisitor();
  if (!ids.length) return [];
  let query = supabase.from("platform").select("*").in("id", ids).eq("visible", true).neq("status", "restricted").order("featured", { ascending: false }).order("updated_at", { ascending: false }).limit(limit);
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) {
    console.error("getPublicPlatforms:", error.message);
    return [];
  }
  return (data || []).map((row) => mapPlatformRow(row as Record<string, unknown>)).filter((p) => !p.archived);
}

export async function getPublicPlatform(slug: string, kind?: PlatformKind): Promise<Platform | null> {
  const supabase = serverClient();
  if (!supabase) return null;
  let query = supabase.from("platform").select("*").eq("slug", slug).eq("visible", true).neq("status", "restricted");
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query.maybeSingle();
  if (error || !data || data.archived) return null;
  const decision = await platformMarketDecision(data.id, await visitorMarketContext());
  if (!decision.visible) return null;
  return mapPlatformRow(data as Record<string, unknown>);
}

export async function getResearchPlatform(slug: string, kind?: PlatformKind): Promise<Platform | null> {
  const supabase = serverClient();
  if (!supabase) return null;
  let q = supabase.from("platform").select("*").eq("slug", slug).eq("visible", true).neq("status", "restricted");
  if (kind) q = q.eq("kind", kind);
  const { data } = await q.maybeSingle();
  if (!data || data.archived) return null;
  return mapPlatformRow(data as Record<string, unknown>);
}

export async function getSitemapPlatforms() {
  const supabase = serverClient();
  if (!supabase) return [];
  const { data } = await supabase.from("platform").select("*").eq("visible", true).neq("status", "restricted").limit(1000);
  return (data || []).map((row) => mapPlatformRow(row as Record<string, unknown>)).filter((p) => !p.archived);
}

export async function countPublicByKind(kind: PlatformKind) {
  const items = await getSitemapPlatforms();
  return items.filter((item) => item.kind === kind).length;
}
