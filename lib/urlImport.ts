import { parsePublicHttpUrl } from "@/lib/httpUrl";
import { safePublicFetch } from "@/lib/ssrf";

export type FieldStatus = "imported" | "missing" | "needs_review";
export type ImportedField<T = string> = {
  value: T | null;
  status: FieldStatus;
  sourceUrl: string | null;
  confidence: "high" | "medium" | "low";
};

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return (match?.[2] || match?.[3] || match?.[4] || "").trim();
}

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decode(match[1]);
  }
  return "";
}

function collectMeta(html: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const map = new Map<string, string>();
  for (const tag of tags) {
    const key = (attr(tag, "property") || attr(tag, "name") || attr(tag, "itemprop")).toLowerCase();
    const content = decode(attr(tag, "content"));
    if (key && content && !map.has(key)) map.set(key, content);
  }
  return map;
}

function collectIcons(html: string, base: URL) {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const icons: string[] = [];
  for (const tag of links) {
    const rel = attr(tag, "rel").toLowerCase();
    const href = attr(tag, "href");
    if (!href) continue;
    if (rel.includes("icon") || rel.includes("apple-touch")) {
      try { icons.push(new URL(href, base).toString()); } catch { /* ignore */ }
    }
  }
  return icons;
}

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
  const title = firstMatch(html, [/<title[^>]*>([^<]{2,180})<\/title>/i]) || meta.get("og:title") || meta.get("twitter:title") || "";
  const description = meta.get("description") || meta.get("og:description") || meta.get("twitter:description") || "";
  const ogImage = meta.get("og:image") || meta.get("twitter:image") || "";
  const siteName = meta.get("og:site_name") || title.split(/[|\-–—]/)[0]?.trim() || base.hostname.replace(/^www\./, "");
  const canonical = meta.get("og:url") || firstMatch(html, [/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i]) || fetched.finalUrl;
  const icons = collectIcons(html, base);
  const logo = ogImage || icons[0] || `${base.origin}/favicon.ico`;
  const locale = meta.get("og:locale") || "";
  const retrievedAt = new Date().toISOString();

  return {
    sourceUrl: parsed.url.toString(),
    finalUrl: fetched.finalUrl,
    retrievedAt,
    httpStatus: fetched.status,
    fields: {
      name: field(siteName.replace(/\s+(official|home|login|sign up)$/i, ""), fetched.finalUrl, "medium"),
      officialUrl: field(base.origin, fetched.finalUrl, "high"),
      seoTitle: field(title.slice(0, 70), fetched.finalUrl, title ? "high" : "low"),
      seoDescription: field(description.slice(0, 160), fetched.finalUrl, description ? "high" : "low"),
      shortDescription: field(description.slice(0, 280), fetched.finalUrl, description ? "medium" : "low"),
      logoUrl: field(logo, fetched.finalUrl, ogImage ? "medium" : "low"),
      ogImageUrl: field(ogImage || null, fetched.finalUrl, ogImage ? "high" : "low"),
      canonicalUrl: field(canonical, fetched.finalUrl, "medium"),
      language: field(locale.slice(0, 16) || null, fetched.finalUrl, locale ? "medium" : "low"),
    },
    missing: [] as string[],
    needsReview: [
      "Confirm the legal entity and product type before publishing.",
      "Do not treat public marketing copy as verified fees, licensing or market eligibility.",
      "Affiliate URLs, GEO rules and commercial CTAs must be entered manually.",
    ],
  };
}
