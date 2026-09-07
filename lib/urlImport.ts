import { classifyKindFromPublicText } from "@/lib/catalog";
import { parsePublicHttpUrl } from "@/lib/httpUrl";
import { collectIcons, collectMeta, firstMatch } from "@/lib/import/extractHtml";
import { extractJsonLd } from "@/lib/import/extractJsonLd";
import { safePublicFetch } from "@/lib/ssrf";

export type FieldStatus = "imported" | "missing" | "needs_review";
export type ImportedField<T = string> = {
  value: T | null;
  status: FieldStatus;
  sourceUrl: string | null;
  confidence: "high" | "medium" | "low";
};

function field(value: string | null, sourceUrl: string, confidence: ImportedField["confidence"] = "medium"): ImportedField {
  const clean = value?.trim() || null;
  return {
    value: clean,
    status: clean ? "imported" : "missing",
    sourceUrl: clean ? sourceUrl : null,
    confidence: clean ? confidence : "low",
  };
}

export async function importPublicPlatformMetadata(inputUrl: string) {
  const parsed = parsePublicHttpUrl(inputUrl);
  if (!parsed.ok) throw new Error(parsed.error);
  const fetched = await safePublicFetch(parsed.url.toString());
  const html = fetched.body;
  const base = new URL(fetched.finalUrl);
  const meta = collectMeta(html);
  const jsonLd = extractJsonLd(html);
  const title = firstMatch(html, [/<title[^>]*>([^<]{2,180})<\/title>/i]) || meta.get("og:title") || meta.get("twitter:title") || jsonLd.name || "";
  const description = meta.get("description") || meta.get("og:description") || meta.get("twitter:description") || jsonLd.description || "";
  const ogImage = meta.get("og:image") || meta.get("twitter:image") || "";
  const siteName = jsonLd.name || meta.get("og:site_name") || title.split(/[|\-–—]/)[0]?.trim() || base.hostname.replace(/^www\./, "");
  const canonical = meta.get("og:url") || firstMatch(html, [/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i]) || jsonLd.url || fetched.finalUrl;
  const icons = collectIcons(html, base);
  const logo = icons[0] || null;
  const locale = meta.get("og:locale") || "";
  const retrievedAt = new Date().toISOString();
  const classified = classifyKindFromPublicText({ title, description, host: base.hostname });

  return {
    sourceUrl: parsed.url.toString(),
    finalUrl: fetched.finalUrl,
    retrievedAt,
    httpStatus: fetched.status,
    extractors: ["url-resolver", "metadata", "json-ld", "brand-icons", "category-classifier"],
    structuredData: { types: jsonLd.types, usedName: Boolean(jsonLd.name), usedDescription: Boolean(jsonLd.description) },
    suggestedKind: classified,
    fields: {
      name: field(siteName.replace(/\s+(official|home|login|sign up)$/i, ""), fetched.finalUrl, jsonLd.name ? "medium" : "medium"),
      officialUrl: field(base.origin, fetched.finalUrl, "high"),
      seoTitle: field(title.slice(0, 70), fetched.finalUrl, title ? "high" : "low"),
      seoDescription: field(description.slice(0, 160), fetched.finalUrl, description ? "high" : "low"),
      shortDescription: field(description.slice(0, 280), fetched.finalUrl, description ? "medium" : "low"),
      logoUrl: field(logo, fetched.finalUrl, "low"),
      ogImageUrl: field(ogImage || null, fetched.finalUrl, ogImage ? "high" : "low"),
      canonicalUrl: field(canonical, fetched.finalUrl, "medium"),
      language: field(locale.slice(0, 16) || null, fetched.finalUrl, locale ? "medium" : "low"),
    },
    missing: [] as string[],
    needsReview: [
      "Confirm the legal entity and product category before publishing.",
      "Imported icons/OG images are not verified brand assets.",
      "JSON-LD and Open Graph are public marketing signals, not verified fees, licensing, KYC or market eligibility.",
      "Affiliate URLs, GEO rules and commercial CTAs must be entered manually.",
      classified.kind ? `Suggested category from public text: ${classified.kind} (needs review, not verified).` : "Category could not be inferred. Choose it manually.",
    ],
  };
}
