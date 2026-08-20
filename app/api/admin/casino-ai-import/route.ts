import { NextRequest, NextResponse } from "next/server";
import { lookup } from "dns/promises";
import net from "net";

import { requireAdmin } from "@/lib/supabase/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { firecrawlConfigured, firecrawlMap, firecrawlScrape, firecrawlSearch, firecrawlSearchLinks } from "@/lib/nivaro-core/firecrawl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FETCH_CHARS = 55_000;
const MAX_TOTAL_SOURCE_CHARS = 120_000;
const MAX_EXTRA_PAGES = 4;
const FETCH_TIMEOUT_MS = 3_200;
const MIN_USEFUL_SOURCE_CHARS = 180;
const MAX_STANDARD_PATHS = 2;

type ImportDraft = {
  name: string | null;
  slug: string | null;
  official_url: string | null;
  affiliate_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  review_content: string | null;
  final_verdict: string | null;
  rating: number | null;
  welcome_bonus: string | null;
  no_deposit: boolean | null;
  no_deposit_bonus: string | null;
  free_spins: boolean | null;
  free_spins_count: number | null;
  free_spins_details: string | null;
  cashback: string | null;
  min_deposit: string | null;
  crypto: boolean | null;
  payment_methods: string[];
  providers: string[];
  games: string[];
  license_info: string | null;
  license_authority: string | null;
  license_number: string | null;
  owner_name: string | null;
  founded_year: number | null;
  country_codes: string[];
  region_codes: string[];
  us_states: string[];
  currencies: string[];
  languages: string[];
  withdrawal_info: string | null;
  withdrawal_limits: string | null;
  payout_speed: string | null;
  kyc_required: boolean | null;
  mobile_app: boolean | null;
  live_chat: boolean | null;
  vip_program: boolean | null;
  support_email: string | null;
  support_url: string | null;
  pros: string[];
  cons: string[];
  seo_title: string | null;
  seo_description: string | null;
  verification_status: "pending" | "verified" | "unverified" | "needs_review";
  ai_import_enabled: boolean;
  ai_import_status:
    | "not_started"
    | "queued"
    | "running"
    | "completed"
    | "partial"
    | "failed"
    | "needs_review";
  ai_import_confidence: number | null;
  ai_imported_at: string | null;
  monitoring_mode: "automatic" | "manual" | "paused";
  monitoring_enabled: boolean;
  auto_update_enabled: boolean;
  monitoring_alerts_enabled: boolean;
  suggested_offers: Array<{ kind: string; title: string; amount: string | null; promo_code: string | null; free_spins_count: number | null; wagering_requirement: string | null; min_deposit: string | null; max_cashout: string | null; terms: string | null; source_url: string | null; confidence: number | null; }>;
  monitoring_status:
    | "pending"
    | "healthy"
    | "checking"
    | "changed"
    | "needs_review"
    | "inaccessible"
    | "paused"
    | "manual"
    | "error";
};

type PageSource = {
  url: string;
  finalUrl: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogImage: string | null;
  icon: string | null;
  brandLogo?: string | null;
  text: string;
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function compactText(value: string): string {
  return value
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .trim();
}


function extractStructuredText(html: string): string {
  const chunks: string[] = [];

  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonMatch: RegExpExecArray | null;
  while ((jsonMatch = jsonLdRegex.exec(html))) {
    const raw = jsonMatch[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      chunks.push(JSON.stringify(parsed));
    } catch {
      chunks.push(raw);
    }
  }

  const nextData = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (nextData) chunks.push(nextData);

  const metaPairs = [...html.matchAll(/<meta\b[^>]*(?:name|property)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi)];
  for (const match of metaPairs.slice(0, 80)) {
    if (match[1] && match[2]) chunks.push(`${match[1]}: ${decodeHtml(match[2])}`);
  }

  return compactText(chunks.join(" ")).slice(0, MAX_FETCH_CHARS);
}

function sourceTextFromHtml(html: string): string {
  const visible = compactText(html);
  const structured = extractStructuredText(html);
  const combined = `${visible} ${structured}`.replace(/\s+/g, " ").trim();
  return combined.slice(0, MAX_FETCH_CHARS);
}

function looksBlockedOrEmpty(html: string, text: string): boolean {
  const haystack = `${html.slice(0, 80_000)} ${text}`.toLowerCase();
  if (text.length >= MIN_USEFUL_SOURCE_CHARS) return false;
  return [
    "checking your browser",
    "just a moment",
    "enable javascript",
    "access denied",
    "request blocked",
    "captcha",
    "cloudflare",
    "bot verification",
  ].some((signal) => haystack.includes(signal));
}

function firstMatch(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const value = match?.[1]?.trim();
    if (value) return decodeHtml(value);
  }
  return null;
}

function resolveUrl(value: string | null, baseUrl: string): string | null {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractTitle(html: string): string | null {
  return firstMatch(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i,
    /<title[^>]*>([\s\S]*?)<\/title>/i,
  ]);
}

function extractDescription(html: string): string | null {
  return firstMatch(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i,
  ]);
}

function extractCanonical(html: string, baseUrl: string): string | null {
  const raw = firstMatch(html, [
    /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical[^"']*["'][^>]*>/i,
  ]);
  return resolveUrl(raw, baseUrl);
}

function extractOgImage(html: string, baseUrl: string): string | null {
  const raw = firstMatch(html, [
    /<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["'][^>]*>/i,
  ]);
  return resolveUrl(raw, baseUrl);
}

function extractIcon(html: string, baseUrl: string): string | null {
  const raw = firstMatch(html, [
    /<link[^>]+rel=["'][^"']*(?:apple-touch-icon|icon)[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*(?:apple-touch-icon|icon)[^"']*["'][^>]*>/i,
  ]);
  return resolveUrl(raw, baseUrl);
}

function extractBrandLogo(html: string, baseUrl: string): string | null {
  const imgRegex = /<img\b[^>]*>/gi;
  const candidates: Array<{ url: string; score: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html))) {
    const tag = match[0];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1]
      || tag.match(/\bdata-src=["']([^"']+)["']/i)?.[1]
      || tag.match(/\bdata-lazy-src=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    const resolved = resolveUrl(src, baseUrl);
    if (!resolved) continue;
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] || "";
    const cls = tag.match(/\bclass=["']([^"']*)["']/i)?.[1] || "";
    const id = tag.match(/\bid=["']([^"']*)["']/i)?.[1] || "";
    const haystack = `${src} ${alt} ${cls} ${id}`.toLowerCase();
    let score = 0;
    if (/logo/.test(haystack)) score += 120;
    if (/brand/.test(haystack)) score += 80;
    if (/header|navbar|nav-logo/.test(haystack)) score += 35;
    if (/favicon|icon/.test(haystack)) score += 15;
    if (/banner|hero|background|promo|bonus/.test(haystack)) score -= 70;
    if (score > 0) candidates.push({ url: resolved, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url || null;
}

function extractCandidateLinks(html: string, baseUrl: string): string[] {
  const scores = new Map<string, number>();
  const linkRegex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html))) {
    const rawHref = match[1];
    const anchorText = compactText(match[2]).toLowerCase();

    let url: URL;
    let base: URL;

    try {
      url = new URL(rawHref, baseUrl);
      base = new URL(baseUrl);
    } catch {
      continue;
    }

    if (!["http:", "https:"].includes(url.protocol)) continue;
    if (url.hostname !== base.hostname) continue;

    const haystack = `${url.pathname} ${anchorText}`.toLowerCase();
    let score = 0;

    const signals: Array<[RegExp, number]> = [
      [/\bbonus|promotion|promo|offer\b/, 9],
      [/\bterms|conditions|rules\b/, 8],
      [/\bpayment|deposit|withdraw|cashout|payout\b/, 8],
      [/\blicen[cs]e|regulation|legal\b/, 8],
      [/\babout|company|operator\b/, 6],
      [/\bsupport|contact|help\b/, 6],
      [/\bvip\b/, 4],
      [/\bcrypto|bitcoin\b/, 4],
      [/\bgame|provider|casino\b/, 3],
    ];

    for (const [pattern, points] of signals) {
      if (pattern.test(haystack)) score += points;
    }

    if (score <= 0) continue;

    url.hash = "";
    const normalized = url.toString();
    scores.set(normalized, Math.max(scores.get(normalized) ?? 0, score));
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_EXTRA_PAGES)
    .map(([url]) => url);
}

function isBlockedIp(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;

  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || a >= 224) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }

  if (net.isIPv6(address)) {
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(normalized)) return true;
  }

  return false;
}

async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid Affiliate URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local") || hostname === "::1") {
    throw new Error("Local/private URLs are not allowed.");
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length) {
    throw new Error("The Affiliate URL hostname could not be resolved.");
  }
  if (records.some((record) => isBlockedIp(record.address))) {
    throw new Error("Private/internal network addresses are not allowed.");
  }

  return url;
}

async function fetchPageWithSafeRedirects(rawUrl: string): Promise<{ finalUrl: string; html: string }> {
  let current = (await assertSafePublicUrl(rawUrl)).toString();
  const cookieJar = new Map<string, string>();

  for (let redirectCount = 0; redirectCount <= 8; redirectCount++) {
    const safeUrl = await assertSafePublicUrl(current);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const cookieHeader = [...cookieJar.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");

    try {
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Upgrade-Insecure-Requests": "1",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      });

      const setCookies =
        typeof (response.headers as any).getSetCookie === "function"
          ? (response.headers as any).getSetCookie()
          : response.headers.get("set-cookie")
            ? [response.headers.get("set-cookie") as string]
            : [];

      for (const setCookie of setCookies) {
        const pair = setCookie.split(";", 1)[0] ?? "";
        const eq = pair.indexOf("=");
        if (eq > 0) {
          cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
        }
      }

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error(`Redirect ${response.status} did not include a location.`);
        current = new URL(location, current).toString();
        continue;
      }

      if (!response.ok) {
        throw new Error(`Source returned HTTP ${response.status} ${response.statusText}`.trim());
      }

      const html = (await response.text()).slice(0, 750_000);

      const metaRefresh = html.match(
        /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url\s*=\s*([^"'>;]+)[^"']*["'][^>]*>/i
      )?.[1]?.trim();

      const jsRedirect =
        html.match(/(?:window\.)?location(?:\.href)?\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() ||
        html.match(/location\.replace\(\s*["']([^"']+)["']\s*\)/i)?.[1]?.trim();

      const browserRedirect = metaRefresh || jsRedirect;
      if (browserRedirect && redirectCount < 8) {
        const next = new URL(browserRedirect, current).toString();
        await assertSafePublicUrl(next);
        current = next;
        continue;
      }

      return { finalUrl: safeUrl.toString(), html };
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Too many redirects while resolving Affiliate URL.");
}

type AffiliateResolution = {
  finalUrl: string;
  html: string;
  status: number;
  ok: boolean;
  accessLimited: boolean;
  redirectChain: string[];
};

function looksLikeTrackingHost(hostname: string) {
  const host = hostname.toLowerCase();
  return /(^|\.)(aff|affiliate|track|tracking|go|click|redirect|link|links|partner|partners)([.-]|$)/i.test(host)
    || /affise|incomeaccess|netrefer|cellxpert|scaleo|myaffiliates|referon|softswiss|everflow|impact|postaffiliate|fluxbrox/i.test(host);
}

async function resolveAffiliateDestination(rawUrl: string): Promise<AffiliateResolution> {
  let current = (await assertSafePublicUrl(rawUrl)).toString();
  const redirectChain: string[] = [current];
  const cookieJar = new Map<string, string>();

  for (let redirectCount = 0; redirectCount <= 8; redirectCount++) {
    const safeUrl = await assertSafePublicUrl(current);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const cookieHeader = [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");

    try {
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      });

      const setCookies = typeof (response.headers as any).getSetCookie === "function"
        ? (response.headers as any).getSetCookie()
        : response.headers.get("set-cookie") ? [response.headers.get("set-cookie") as string] : [];
      for (const setCookie of setCookies) {
        const pair = setCookie.split(";", 1)[0] ?? "";
        const eq = pair.indexOf("=");
        if (eq > 0) cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) break;
        current = new URL(location, current).toString();
        redirectChain.push(current);
        continue;
      }

      const html = (await response.text().catch(() => "")).slice(0, 750_000);
      const text = sourceTextFromHtml(html);
      const metaRefresh = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url\s*=\s*([^"'>;]+)[^"']*["'][^>]*>/i)?.[1]?.trim();
      const jsRedirect = html.match(/(?:window\.)?location(?:\.href)?\s*=\s*["']([^"']+)["']/i)?.[1]?.trim()
        || html.match(/location\.replace\(\s*["']([^"']+)["']\s*\)/i)?.[1]?.trim();
      const browserRedirect = metaRefresh || jsRedirect;
      if (browserRedirect && redirectCount < 8) {
        current = new URL(browserRedirect, current).toString();
        redirectChain.push(current);
        continue;
      }

      const accessLimited = !response.ok || looksBlockedOrEmpty(html, text)
        || /access denied|not available in your (?:country|region)|restricted (?:country|region)|geo(?:graphic)? restriction|prohibited in (?:your|this) (?:country|region)/i.test(text.slice(0, 12000));

      return {
        finalUrl: safeUrl.toString(),
        html,
        status: response.status,
        ok: response.ok,
        accessLimited,
        redirectChain,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { finalUrl: current, html: "", status: 0, ok: false, accessLimited: true, redirectChain };
}

function probableOfficialOrigin(affiliateUrl: string, resolvedUrl: string | null) {
  try {
    const affiliateHost = new URL(affiliateUrl).hostname.replace(/^www\./, "").toLowerCase();
    if (!resolvedUrl) return null;
    const resolved = new URL(resolvedUrl);
    const resolvedHost = resolved.hostname.replace(/^www\./, "").toLowerCase();
    if (resolvedHost !== affiliateHost && !looksLikeTrackingHost(resolvedHost)) return resolved.origin;
    return null;
  } catch {
    return null;
  }
}

async function scrapeWithFirecrawl(rawUrl: string): Promise<PageSource | null> {
  if (!firecrawlConfigured()) return null;
  const safeUrl = (await assertSafePublicUrl(rawUrl)).toString();
  const page = await firecrawlScrape(safeUrl);
  if (!page) return null;
  return {
    url: safeUrl,
    finalUrl: page.finalUrl,
    title: page.title,
    description: page.description,
    canonical: page.canonical,
    ogImage: page.ogImage,
    icon: page.icon,
    brandLogo: page.brandLogo,
    text: page.markdown.slice(0, MAX_FETCH_CHARS),
  };
}

async function fetchFirecrawlSources(urls: string[]): Promise<PageSource[]> {
  if (!firecrawlConfigured()) return [];
  const unique = [...new Set(urls.filter(Boolean))].slice(0, MAX_EXTRA_PAGES + 6);
  const results = await Promise.allSettled(unique.map((url) => scrapeWithFirecrawl(url)));
  const pages: PageSource[] = [];
  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue;
    if (!pages.some((page) => page.finalUrl === result.value!.finalUrl)) pages.push(result.value);
  }
  return pages;
}

async function discoverRenderedSources(baseUrls: string[]): Promise<PageSource[]> {
  if (!firecrawlConfigured()) return [];

  const origins = Array.from(new Set(baseUrls.filter(Boolean).map((raw) => {
    try { return new URL(raw).origin; } catch { return null; }
  }).filter((value): value is string => Boolean(value)))).slice(0, 2);

  if (!origins.length) return [];

  // One map request per origin is materially faster and more reliable than several
  // sequential keyword maps. We rank the discovered links locally afterwards.
  const mapResults = await Promise.allSettled(origins.map((origin) => firecrawlMap(origin, undefined, 60)));
  const discovered = new Set<string>(origins);
  for (const result of mapResults) {
    if (result.status !== "fulfilled") continue;
    for (const link of result.value) discovered.add(link);
  }

  const priorityScore = (raw: string) => {
    let score = 0;
    if (/bonus|promo|offer|welcome|free[-_ ]?spin/i.test(raw)) score += 12;
    if (/terms|condition|rules/i.test(raw)) score += 10;
    if (/licen[cs]|regulat|responsible|legal/i.test(raw)) score += 10;
    if (/payment|deposit|withdraw|cashout|payout/i.test(raw)) score += 8;
    if (/support|contact|help|about|company|operator/i.test(raw)) score += 6;
    if (/\/($|[?#])/.test(raw)) score += 4;
    return score;
  };

  const priority = [...discovered]
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, MAX_EXTRA_PAGES + 5);

  return fetchFirecrawlSources(priority);
}


function normalizeBrandToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function inferBrandHintFromSearchHits(hits: Array<{ title: string | null; description: string | null }>) {
  const counts = new Map<string, { label: string; count: number }>();
  const add = (raw: string | undefined | null) => {
    if (!raw) return;
    const cleaned = raw.replace(/\s+/g, " ").trim();
    const patterns = [
      /\b([A-Z][A-Za-z0-9'’-]{2,28})\s+(?:Online\s+)?Casino\b/g,
      /^([A-Z][A-Za-z0-9'’-]{2,28})\s*[:|\-–—]/g,
      /\b([A-Z][A-Za-z0-9'’-]{2,28})\s+(?:Sportsbook|Betting)\b/g,
    ];
    for (const pattern of patterns) {
      for (const match of cleaned.matchAll(pattern)) {
        const label = match[1]?.trim();
        if (!label) continue;
        const token = normalizeBrandToken(label);
        if (!token || /^(casino|online|official|bonus|review|sports|betting|welcome)$/.test(token)) continue;
        const prev = counts.get(token);
        counts.set(token, { label, count: (prev?.count ?? 0) + 1 });
      }
    }
  };
  for (const hit of hits) {
    add(hit.title);
    add(hit.description);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0]?.label ?? null;
}

function pageMatchesBrand(page: PageSource, brandHint: string) {
  const token = normalizeBrandToken(brandHint);
  if (!token) return false;
  try {
    const hostToken = normalizeBrandToken(new URL(page.finalUrl).hostname.replace(/^www\./, "").split(".")[0] || "");
    const body = normalizeBrandToken(`${page.title || ""} ${page.description || ""} ${page.text.slice(0, 5000)}`);
    return hostToken.includes(token) && body.includes(token);
  } catch {
    return false;
  }
}

async function discoverAlternateOfficialSources(hostHint: string, casinoNameHint?: string): Promise<PageSource[]> {
  if (!firecrawlConfigured() || !hostHint) return [];

  // Search is used only to discover a brand/origin when a GEO mirror or affiliate
  // destination blocks our server. The resulting pages still have to self-identify.
  const discoveryHits = await firecrawlSearchLinks(`"${hostHint}" casino`, 6);
  const brandHint = casinoNameHint || inferBrandHintFromSearchHits(discoveryHits);
  if (!brandHint) return [];

  const brandToken = normalizeBrandToken(brandHint);
  if (!brandToken) return [];

  const candidateUrls = new Set<string>();
  // A direct brand .com probe is discovery-only; it is accepted only after the page
  // hostname and page content both self-identify as the same brand.
  candidateUrls.add(`https://${brandToken}.com/`);

  for (const hit of discoveryHits) {
    try {
      const parsed = new URL(hit.url);
      const hostToken = normalizeBrandToken(parsed.hostname.replace(/^www\./, "").split(".")[0] || "");
      if (hostToken.includes(brandToken)) candidateUrls.add(parsed.origin + "/");
    } catch {}
  }

  const roots = [...candidateUrls].slice(0, 3);
  const urls = roots.flatMap((root) => [
    root,
    ...standardSourceUrls(root),
  ]);

  const pages = await fetchFirecrawlSources(urls);
  return pages.filter((page) => pageMatchesBrand(page, brandHint));
}


async function discoverFromOpaqueAffiliateUrl(affiliateUrl: string, redirectChain: string[] = []): Promise<PageSource[]> {
  if (!firecrawlConfigured()) return [];

  let parsed: URL;
  try { parsed = new URL(affiliateUrl); } catch { return []; }
  const host = parsed.hostname.replace(/^www\./, "");
  const ids = [...parsed.searchParams.values()]
    .map((value) => value.trim())
    .filter((value) => /^[a-z0-9_-]{5,40}$/i.test(value))
    .slice(0, 4);

  const queries = [
    `"${affiliateUrl}" casino`,
    ids.length ? `"${host}" "${ids[ids.length - 1]}" casino` : `"${host}" casino`,
    ids.length ? `"${ids[ids.length - 1]}" casino affiliate` : `"${host}" gambling brand`,
  ];

  const batches = await Promise.allSettled(queries.map((query) => firecrawlSearchLinks(query, 8)));
  const hits: Array<{ url: string; title: string | null; description: string | null }> = [];
  for (const batch of batches) {
    if (batch.status !== "fulfilled") continue;
    for (const hit of batch.value) {
      if (!hits.some((item) => item.url === hit.url)) hits.push(hit);
    }
  }

  // Redirect-chain origins are useful hints when a tracker reaches a branded mirror
  // before the final GEO block. Search hits remain discovery-only and must self-identify.
  for (const raw of redirectChain) {
    try {
      const h = new URL(raw).hostname.replace(/^www\./, "");
      if (h && h !== host && !looksLikeTrackingHost(h)) {
        hits.push({ url: new URL(raw).origin + "/", title: null, description: null });
      }
    } catch {}
  }

  const brandHint = inferBrandHintFromSearchHits(hits);
  if (!brandHint) return [];
  const brandToken = normalizeBrandToken(brandHint);
  if (!brandToken) return [];

  const roots = new Set<string>();
  for (const hit of hits) {
    try {
      const u = new URL(hit.url);
      const hostname = u.hostname.replace(/^www\./, "");
      if (looksLikeTrackingHost(hostname)) continue;
      const hostToken = normalizeBrandToken(hostname.split(".")[0] || "");
      const hitText = normalizeBrandToken(`${hit.title || ""} ${hit.description || ""}`);
      if (hostToken.includes(brandToken) || hitText.includes(brandToken)) roots.add(u.origin + "/");
    } catch {}
  }
  roots.add(`https://${brandToken}.com/`);

  const candidates = [...roots].slice(0, 4).flatMap((root) => [root, ...standardSourceUrls(root)]);
  const pages = await fetchFirecrawlSources(candidates);
  return pages.filter((page) => pageMatchesBrand(page, brandHint));
}

async function buildPageSource(url: string): Promise<PageSource> {
  const { finalUrl, html } = await fetchPageWithSafeRedirects(url);
  return {
    url,
    finalUrl,
    title: extractTitle(html),
    description: extractDescription(html),
    canonical: extractCanonical(html, finalUrl),
    ogImage: extractOgImage(html, finalUrl),
    icon: extractIcon(html, finalUrl),
    brandLogo: extractBrandLogo(html, finalUrl),
    text: sourceTextFromHtml(html),
  };
}


function sourceIsUseful(page: PageSource): boolean {
  return Boolean(
    page.text.length >= MIN_USEFUL_SOURCE_CHARS ||
    page.title ||
    page.description ||
    page.canonical
  );
}

function standardSourceUrls(baseUrl: string): string[] {
  try {
    const origin = new URL(baseUrl).origin;
    return [
      `${origin}/`,
      `${origin}/promotions`,
      `${origin}/bonuses`,
      `${origin}/terms-and-conditions`,
      `${origin}/payments`,
      `${origin}/about`,
      `${origin}/contact`,
    ].slice(0, MAX_STANDARD_PATHS + 1);
  } catch {
    return [];
  }
}

async function fetchUniqueSources(urls: string[]): Promise<PageSource[]> {
  const unique = [...new Set(urls.filter(Boolean))];
  const results = await Promise.allSettled(unique.map((url) => buildPageSource(url)));
  const pages: PageSource[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const page = result.value;
    if (!pages.some((item) => item.finalUrl === page.finalUrl)) pages.push(page);
  }

  return pages;
}

function extractGeminiResponseText(payload: any): string {
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseJsonObject(value: string): Record<string, any> {
  const trimmed = value.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("AI response did not contain valid JSON.");
  }
}

function nullableText(value: unknown, max = 10_000): string | null {
  if (typeof value !== "string") return null;
  const clean = value.replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, max) : null;
}

function stringArray(value: unknown, maxItems = 50): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => String(item ?? "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
    )
  ).slice(0, maxItems);
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function nullableNumber(value: unknown, min: number, max: number): number | null {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return number;
}

function nullableInteger(value: unknown, min: number, max: number): number | null {
  const number = nullableNumber(value, min, max);
  return number === null ? null : Math.round(number);
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeCountryCodes(value: unknown): string[] {
  const aliases: Record<string, string> = {
    UK: "GB", GBR: "GB", USA: "US", DEU: "DE", CAN: "CA", AUS: "AU",
    AUT: "AT", CHE: "CH", FRA: "FR", ESP: "ES", ITA: "IT", NLD: "NL",
    BEL: "BE", SWE: "SE", NOR: "NO", DNK: "DK", FIN: "FI", IRL: "IE",
    PRT: "PT", POL: "PL", GRC: "GR", GEO: "GE",
  };

  return Array.from(
    new Set(
      stringArray(value)
        .map((item) => item.toUpperCase())
        .map((item) => aliases[item] ?? item)
        .filter((item) => /^[A-Z]{2}$/.test(item))
    )
  ).sort();
}

function normalizeUrl(value: unknown): string | null {
  const clean = nullableText(value, 2000);
  if (!clean) return null;

  try {
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(clean) ? clean : `https://${clean}`;
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function bestBrandAsset(pages: PageSource[]): { logo: string | null; cover: string | null } {
  const candidates: Array<{ url: string; score: number; kind: "logo" | "cover" }> = [];
  const seen = new Set<string>();
  const add = (raw: string | null | undefined, score: number, kind: "logo" | "cover") => {
    if (!raw || seen.has(raw)) return;
    seen.add(raw);
    candidates.push({ url: raw, score, kind });
  };
  for (const page of pages) {
    add(page.brandLogo, 125, "logo");
    if (page.icon) add(page.icon, /logo|brand/i.test(page.icon) ? 95 : 68, "logo");
    if (page.ogImage) {
      const logoish = /logo|brand|icon/i.test(page.ogImage);
      add(page.ogImage, logoish ? 90 : 58, logoish ? "logo" : "cover");
    }
  }
  candidates.sort((a,b)=>b.score-a.score);
  return {
    logo: candidates.find((c)=>c.kind === "logo")?.url || null,
    cover: candidates.find((c)=>c.kind === "cover")?.url || candidates.find((c)=>c.kind === "logo")?.url || null,
  };
}

function calculateImportConfidence(draft: ImportDraft, pages: PageSource[], warnings: string[]) {
  let score = 0;
  if (draft.name) score += 18;
  if (draft.official_url) score += 18;
  if (draft.logo_url) score += 8;
  if (draft.owner_name || draft.license_authority || draft.license_number) score += 14;
  if (draft.description) score += 8;
  if (draft.payment_methods.length || draft.withdrawal_info) score += 8;
  if (draft.support_url || draft.support_email || draft.live_chat !== null) score += 6;
  if (draft.suggested_offers.length) score += 8;
  const healthy = pages.filter((p)=>p.text.length >= 500).length;
  score += Math.min(12, healthy * 3);
  if (warnings.some((w)=>/404|not found|blocked|conflict|unavailable|identity mismatch/i.test(w))) score -= 8;
  return Math.max(0, Math.min(96, score));
}

function sanitizeDraft(
  parsed: Record<string, any>,
  affiliateUrl: string,
  fallbackOfficialUrl: string,
  fallbackCover: string | null
): ImportDraft {
  const name = nullableText(parsed.name, 180);

  const rawVerification = nullableText(parsed.verification_status, 40);
  // Content extraction can suggest identity, but cannot grant public/legal approval.
  const verificationStatus: ImportDraft["verification_status"] =
    rawVerification === "needs_review" ? "needs_review" : "pending";

  const confidence = nullableNumber(parsed.ai_import_confidence, 0, 100);
  const aiStatus: ImportDraft["ai_import_status"] =
    verificationStatus === "needs_review"
      ? "needs_review"
      : confidence !== null && confidence >= 90
        ? "completed"
        : "partial";

  return {
    name,
    slug: nullableText(parsed.slug, 120) || (name ? slugify(name) : null),
    official_url: normalizeUrl(parsed.official_url) || normalizeUrl(fallbackOfficialUrl),
    affiliate_url: affiliateUrl,
    logo_url: normalizeUrl(parsed.logo_url),
    cover_image_url: normalizeUrl(parsed.cover_image_url) || fallbackCover || null,
    description: nullableText(parsed.description, 1_500),
    review_content: nullableText(parsed.review_content, 8_000),
    final_verdict: nullableText(parsed.final_verdict, 2_000),
    rating: nullableNumber(parsed.rating, 0, 10),
    welcome_bonus: nullableText(parsed.welcome_bonus, 1_000),
    no_deposit: nullableBoolean(parsed.no_deposit),
    no_deposit_bonus: nullableText(parsed.no_deposit_bonus, 1_000),
    free_spins: nullableBoolean(parsed.free_spins),
    free_spins_count: nullableInteger(parsed.free_spins_count, 0, 100_000),
    free_spins_details: nullableText(parsed.free_spins_details, 2_000),
    cashback: nullableText(parsed.cashback, 1_000),
    min_deposit: nullableText(parsed.min_deposit, 500),
    crypto: nullableBoolean(parsed.crypto),
    payment_methods: stringArray(parsed.payment_methods),
    providers: stringArray(parsed.providers),
    games: stringArray(parsed.games),
    license_info: nullableText(parsed.license_info, 1_000),
    license_authority: nullableText(parsed.license_authority, 500),
    license_number: nullableText(parsed.license_number, 500),
    owner_name: nullableText(parsed.owner_name, 500),
    founded_year: nullableInteger(parsed.founded_year, 1900, 2100),
    // GEO is never auto-approved by AI. Nivaro Core market compliance owns publication eligibility.
    country_codes: [],
    region_codes: [],
    us_states: [],
    currencies: stringArray(parsed.currencies),
    languages: stringArray(parsed.languages),
    withdrawal_info: nullableText(parsed.withdrawal_info, 2_000),
    withdrawal_limits: nullableText(parsed.withdrawal_limits, 1_500),
    payout_speed: nullableText(parsed.payout_speed, 500),
    kyc_required: nullableBoolean(parsed.kyc_required),
    mobile_app: nullableBoolean(parsed.mobile_app),
    live_chat: nullableBoolean(parsed.live_chat),
    vip_program: nullableBoolean(parsed.vip_program),
    support_email: nullableText(parsed.support_email, 500),
    support_url: normalizeUrl(parsed.support_url),
    pros: stringArray(parsed.pros, 12),
    cons: stringArray(parsed.cons, 12),
    seo_title: nullableText(parsed.seo_title, 70),
    seo_description: nullableText(parsed.seo_description, 170),
    verification_status: verificationStatus,
    ai_import_enabled: true,
    ai_import_status: aiStatus,
    ai_import_confidence: confidence,
    ai_imported_at: new Date().toISOString(),
    monitoring_mode: "automatic",
    monitoring_enabled: true,
    auto_update_enabled: true,
    monitoring_alerts_enabled: true,
    suggested_offers: Array.isArray(parsed.suggested_offers)
      ? parsed.suggested_offers.slice(0, 12).map((offer: any) => ({
          kind: nullableText(offer?.kind, 60) || "other",
          title: nullableText(offer?.title, 300) || "Casino offer",
          amount: nullableText(offer?.amount, 700),
          promo_code: nullableText(offer?.promo_code, 120),
          free_spins_count: nullableInteger(offer?.free_spins_count, 0, 100000),
          wagering_requirement: nullableText(offer?.wagering_requirement, 250),
          min_deposit: nullableText(offer?.min_deposit, 120),
          max_cashout: nullableText(offer?.max_cashout, 180),
          terms: nullableText(offer?.terms, 1200),
          source_url: normalizeUrl(offer?.source_url) || normalizeUrl(fallbackOfficialUrl),
          confidence: nullableNumber(offer?.confidence, 0, 100),
        })).filter((offer: any) => offer.title && (offer.amount || offer.promo_code || offer.free_spins_count || offer.terms))
      : [],
    monitoring_status: "pending",
  };
}


function deterministicDraft(pages: PageSource[], affiliateUrl: string): { draft: ImportDraft; warnings: string[]; model: string } {
  const main = pages[0];
  const domain = (() => { try { return new URL(main.canonical || main.finalUrl).hostname.replace(/^www\./, ""); } catch { return "casino"; } })();
  const rawName = (main.title || domain.split(".")[0] || "Casino")
    .replace(/\s*[|\-–—]\s*(online casino|casino|official site|sportsbook).*$/i, "")
    .replace(/\s*[|\-–—]\s*.*$/, "")
    .trim();
  const name = rawName || domain.split(".")[0];
  const combined = pages.map((p) => `${p.text}\n${p.description || ""}`).join("\n").slice(0, 140000);
  const lower = combined.toLowerCase();
  const money = combined.match(/(?:100%|\d{1,3}%)[^\n.]{0,90}(?:€|£|\$|C\$|CA\$)\s?[\d,.]+|(?:€|£|\$|C\$|CA\$)\s?[\d,.]+[^\n.]{0,90}(?:free spins|bonus)/i)?.[0] || null;
  const freeSpinsMatch = combined.match(/(\d{1,4})\s+free\s+spins/i);
  const promo = combined.match(/(?:promo(?:tion)?\s*code|bonus\s*code)\s*[:\-]?\s*([A-Z0-9_-]{3,30})/i)?.[1] || null;
  const wagering = combined.match(/(?:wager(?:ing)?|playthrough)\s*(?:requirement)?\s*[:\-]?\s*(\d{1,3})\s*[x×]/i)?.[1];
  const minDeposit = combined.match(/(?:minimum|min\.?)[\s-]+deposit\s*[:\-]?\s*((?:€|£|\$|C\$|CA\$)\s?[\d,.]+)/i)?.[1] || null;
  const licenseAuthority = combined.match(/(UK Gambling Commission|Gambling Commission|Cura[cç]ao Gaming Authority|Cura[cç]ao Gaming Control Board|Malta Gaming Authority|Danish Gambling Authority|Spillemyndigheden|AGCO|iGaming Ontario)/i)?.[1] || null;
  const supportEmail = combined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
  const currencyCandidates = [...new Set((combined.match(/\b(?:EUR|USD|GBP|CAD|AUD|NZD|DKK|SEK|NOK|CHF|PLN|USDT|BTC|ETH)\b/g) || []))].slice(0, 20);
  const paymentNames = ["Visa","Mastercard","Skrill","Neteller","Interac","Apple Pay","Google Pay","Paysafecard","MiFinity","MuchBetter","Bank Transfer","Bitcoin","Ethereum","Tether","Litecoin"];
  const payments = paymentNames.filter((x) => lower.includes(x.toLowerCase()));
  const providerNames = ["Pragmatic Play","Evolution","Play'n GO","NetEnt","Playtech","BGaming","Yggdrasil","Quickspin","Ezugi","Microgaming","Hacksaw Gaming","Nolimit City"];
  const providers = providerNames.filter((x) => lower.includes(x.toLowerCase()));
  const games = ["Slots","Live Casino","Blackjack","Roulette","Baccarat","Poker","Crash Games","Sports Betting"].filter((x) => lower.includes(x.toLowerCase().replace(" games", "")));
  const offerTitle = money ? `Current offer: ${money.replace(/\s+/g, " ").trim()}` : freeSpinsMatch ? `${freeSpinsMatch[1]} Free Spins` : promo ? `Promo code ${promo}` : null;
  const suggestedOffers = offerTitle ? [{
    kind: promo ? "promo_code" : freeSpinsMatch ? "free_spins" : "welcome",
    title: offerTitle,
    amount: money,
    promo_code: promo,
    free_spins_count: freeSpinsMatch ? Number(freeSpinsMatch[1]) : null,
    wagering_requirement: wagering ? `${wagering}x` : null,
    min_deposit: minDeposit,
    max_cashout: null,
    terms: null,
    source_url: pages.find((p) => /bonus|promo|offer|terms/i.test(p.finalUrl))?.finalUrl || main.finalUrl,
    confidence: 70,
  }] : [];
  const draft = sanitizeDraft({
    name,
    slug: slugify(name),
    official_url: main.canonical || main.finalUrl,
    logo_url: main.brandLogo || main.icon || null,
    cover_image_url: main.ogImage || main.brandLogo || null,
    description: main.description || `${name} casino profile based on official public-source information.`,
    review_content: null,
    final_verdict: null,
    rating: null,
    welcome_bonus: money,
    no_deposit: null,
    no_deposit_bonus: null,
    free_spins: freeSpinsMatch ? true : null,
    free_spins_count: freeSpinsMatch ? Number(freeSpinsMatch[1]) : null,
    free_spins_details: freeSpinsMatch ? `${freeSpinsMatch[1]} Free Spins` : null,
    cashback: null,
    min_deposit: minDeposit,
    crypto: /bitcoin|ethereum|tether|usdt|crypto/i.test(combined) ? true : null,
    payment_methods: payments,
    providers,
    games,
    license_info: licenseAuthority,
    license_authority: licenseAuthority,
    license_number: null,
    owner_name: null,
    founded_year: null,
    currencies: currencyCandidates,
    languages: [],
    withdrawal_info: null,
    withdrawal_limits: null,
    payout_speed: null,
    kyc_required: /\bkyc\b|identity verification/i.test(combined) ? true : null,
    mobile_app: /mobile app|android app|ios app/i.test(combined) ? true : null,
    live_chat: /live chat/i.test(combined) ? true : null,
    vip_program: /vip program|loyalty program/i.test(combined) ? true : null,
    support_email: supportEmail,
    support_url: pages.find((p) => /support|contact|help/i.test(p.finalUrl))?.finalUrl || null,
    pros: [],
    cons: [],
    seo_title: `${name} Casino Review & Current Information | NivaroBet`,
    seo_description: `Check ${name} casino information, market availability, payments, current offers and NivaroBet verification evidence.`,
    verification_status: "pending",
    ai_import_confidence: Math.min(85, 35 + Math.round(Math.min(50, combined.length / 1500))),
    suggested_offers: suggestedOffers,
    warnings: [],
  }, affiliateUrl, main.canonical || main.finalUrl, main.ogImage);
  return { draft, warnings: ["Deterministic Smart Import used. Legal/market approval remains fail-closed and separate."], model: "nivaro-deterministic-v1" };
}

async function callGemini(
  pages: PageSource[],
  affiliateUrl: string
): Promise<{ draft: ImportDraft; warnings: string[]; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return deterministicDraft(pages, affiliateUrl);
  }

  const model =
    process.env.GEMINI_AI_IMPORT_MODEL?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-3.5-flash-lite";

  const main = pages[0];
  const combinedSources = pages
    .map(
      (page, index) => `SOURCE ${index + 1}\nURL: ${page.finalUrl}\nTITLE: ${page.title ?? ""}\nMETA DESCRIPTION: ${page.description ?? ""}\nCANONICAL: ${page.canonical ?? ""}\nOG IMAGE: ${page.ogImage ?? ""}\nICON: ${page.icon ?? ""}\nTEXT:\n${page.text}`
    )
    .join("\n\n---\n\n")
    .slice(0, MAX_TOTAL_SOURCE_CHARS);

  const prompt = `You are NivaroBet's casino onboarding data extractor.

The administrator supplied one AFFILIATE URL. We resolved that URL and fetched public pages belonging to the destination website.

STRICT ACCURACY RULES:
- Use ONLY facts supported by the supplied SOURCE pages.
- Never invent a license, owner, bonus, GEO, payment method, provider, support detail, or product feature.
- If a factual field cannot be supported, use null or [].
- Do not treat absence of text as proof that something is false. For uncertain boolean fields, use null.
- country_codes means countries where the casino is explicitly available/accepted. Do not guess from languages, currencies, or a country selector alone.
- region_codes is ONLY for explicitly verified province/state/region availability. For Canada use lowercase values such as "ontario" or "alberta" only when the source explicitly supports that region.
- suggested_offers should extract clearly stated current welcome/no-deposit/free-spins/cashback/promo-code offers. Preserve exact promo codes and wagering/min-deposit/max-cashout terms when visible. Never invent missing terms.
- If GEO evidence is conflicting or unclear, verification_status must be "needs_review".
- Keep the affiliate URL exactly as supplied.
- official_url should be the real casino destination/site, not the affiliate tracking URL, when the sources support it.
- cover_image_url can use a clearly relevant page/OG image.
- logo_url must be a genuine brand logo image. Do NOT put a generic hero/cover/banner image into logo_url. If no reliable logo image is evident, return null.
- rating is an editorial NivaroBet rating. Because the sources cannot objectively prove a NivaroBet score, normally return null.
- review_content, pros, cons, final_verdict and SEO copy may be ORIGINAL summaries based only on verified source facts. Do not copy long passages.
- Do not access, request, infer, or mention affiliate earnings, balances, banking, wallets, private partner data, or user data.
- ai_import_confidence is 0-100 and should reflect how complete and reliable this import is overall.
- verification_status is "verified" only when identity and key facts are strongly supported; use "needs_review" for conflicts; otherwise "pending".

Return ONLY valid JSON. No markdown and no commentary.

JSON SHAPE:
{
  "name": string|null,
  "slug": string|null,
  "official_url": string|null,
  "logo_url": string|null,
  "cover_image_url": string|null,
  "description": string|null,
  "review_content": string|null,
  "final_verdict": string|null,
  "rating": number|null,
  "welcome_bonus": string|null,
  "no_deposit": boolean|null,
  "no_deposit_bonus": string|null,
  "free_spins": boolean|null,
  "free_spins_count": number|null,
  "free_spins_details": string|null,
  "cashback": string|null,
  "min_deposit": string|null,
  "crypto": boolean|null,
  "payment_methods": string[],
  "providers": string[],
  "games": string[],
  "license_info": string|null,
  "license_authority": string|null,
  "license_number": string|null,
  "owner_name": string|null,
  "founded_year": number|null,
  "country_codes": string[],
  "region_codes": string[],
  "us_states": string[],
  "currencies": string[],
  "languages": string[],
  "withdrawal_info": string|null,
  "withdrawal_limits": string|null,
  "payout_speed": string|null,
  "kyc_required": boolean|null,
  "mobile_app": boolean|null,
  "live_chat": boolean|null,
  "vip_program": boolean|null,
  "support_email": string|null,
  "support_url": string|null,
  "pros": string[],
  "cons": string[],
  "seo_title": string|null,
  "seo_description": string|null,
  "verification_status": "pending"|"verified"|"unverified"|"needs_review",
  "ai_import_confidence": number,
  "suggested_offers": [
    {
      "kind": "welcome"|"no_deposit"|"free_spins"|"cashback"|"promo_code"|"other",
      "title": string,
      "amount": string|null,
      "promo_code": string|null,
      "free_spins_count": number|null,
      "wagering_requirement": string|null,
      "min_deposit": string|null,
      "max_cashout": string|null,
      "terms": string|null,
      "source_url": string|null,
      "confidence": number
    }
  ],
  "warnings": string[]
}

AFFILIATE URL:\n${affiliateUrl}\n\nRESOLVED PRIMARY URL:\n${main.finalUrl}\n\nSOURCES:\n${combinedSources}`;


  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        payload?.error?.message || `Gemini API returned HTTP ${response.status}.`
      );
    }

    const outputText = extractGeminiResponseText(payload);
    if (!outputText) {
      const finishReason = payload?.candidates?.[0]?.finishReason;
      throw new Error(
        finishReason
          ? `Gemini AI Import returned no text (finish reason: ${finishReason}).`
          : "Gemini AI Import returned an empty response."
      );
    }

    const parsed = parseJsonObject(outputText);
    const draft = sanitizeDraft(
      parsed,
      affiliateUrl,
      main.canonical || main.finalUrl,
      main.ogImage
    );

    return {
      draft,
      warnings: stringArray(parsed.warnings, 20),
      model,
    };
  } catch (error) {
    const fallback = deterministicDraft(pages, affiliateUrl);
    return {
      ...fallback,
      warnings: [
        ...fallback.warnings,
        `Structured AI summarization was unavailable; deterministic extraction continued safely (${error instanceof Error ? error.message : "unknown error"}).`,
      ],
      model: "nivaro-deterministic-fallback-v2",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    await requireAdmin();

    const supabase = await createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "SUPABASE_SERVICE_ROLE_KEY is missing from the server environment.",
        },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawAffiliateUrl = cleanString(body?.affiliateUrl);
    const rawOfficialUrl = cleanString(body?.officialUrl);
    const casinoNameHint = cleanString(body?.casinoName);

    if (!rawAffiliateUrl) {
      return NextResponse.json(
        { success: false, error: "Affiliate URL is required." },
        { status: 400 }
      );
    }

    const normalizedAffiliateUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawAffiliateUrl)
      ? rawAffiliateUrl
      : `https://${rawAffiliateUrl}`;

    await assertSafePublicUrl(normalizedAffiliateUrl);

    const { data: settings, error: settingsError } = await supabase
      .from("automation_settings")
      .select("ai_import_enabled")
      .eq("singleton_key", "global")
      .maybeSingle();

    if (settingsError) {
      console.error("AI Import automation settings read failed:", settingsError.message);
    }

    if (settings && settings.ai_import_enabled === false) {
      return NextResponse.json(
        { success: false, error: "AI Import is disabled in Automation Settings." },
        { status: 403 }
      );
    }

    let primaryResolution: AffiliateResolution | null = null;
    let primaryError: string | null = null;

    try {
      primaryResolution = await resolveAffiliateDestination(normalizedAffiliateUrl);
    } catch (error) {
      primaryError = error instanceof Error ? error.message : "Affiliate source could not be resolved.";
    }

    const inferredOfficialOrigin = probableOfficialOrigin(
      normalizedAffiliateUrl,
      primaryResolution?.finalUrl || null
    );
    const normalizedOfficialUrl = rawOfficialUrl
      ? normalizeUrl(rawOfficialUrl)
      : inferredOfficialOrigin;

    const seedUrls: string[] = [];
    if (primaryResolution?.finalUrl) seedUrls.push(primaryResolution.finalUrl);
    if (normalizedOfficialUrl) seedUrls.push(normalizedOfficialUrl);

    if (primaryResolution?.ok && primaryResolution.html) {
      const canonical = extractCanonical(primaryResolution.html, primaryResolution.finalUrl);
      if (canonical) seedUrls.push(canonical);
      seedUrls.push(...extractCandidateLinks(primaryResolution.html, primaryResolution.finalUrl));
      seedUrls.push(...standardSourceUrls(canonical || primaryResolution.finalUrl));
    } else if (normalizedOfficialUrl) {
      seedUrls.push(...standardSourceUrls(normalizedOfficialUrl));
    }

    if (normalizedOfficialUrl) {
      seedUrls.push(...standardSourceUrls(normalizedOfficialUrl));
    }

    const primaryText = primaryResolution?.html ? sourceTextFromHtml(primaryResolution.html) : "";
    const blockedPrimary = Boolean(primaryResolution?.accessLimited);

    // If the destination already told us it is GEO/403 blocked, do not waste several
    // direct requests against the same blocked origin. Go straight to rendered and
    // alternate official-source discovery.
    let pages = blockedPrimary ? [] : await fetchUniqueSources(seedUrls);

    // Only treat the affiliate destination itself as a factual source when it is readable.
    // An Access Denied/geo-block page is useful routing evidence, but not a casino-data source.
    if (primaryResolution?.ok && !blockedPrimary && primaryResolution.html) {
      const primaryPage: PageSource = {
        url: normalizedAffiliateUrl,
        finalUrl: primaryResolution.finalUrl,
        title: extractTitle(primaryResolution.html),
        description: extractDescription(primaryResolution.html),
        canonical: extractCanonical(primaryResolution.html, primaryResolution.finalUrl),
        ogImage: extractOgImage(primaryResolution.html, primaryResolution.finalUrl),
        icon: extractIcon(primaryResolution.html, primaryResolution.finalUrl),
        text: primaryText,
      };
      pages = [primaryPage, ...pages.filter((page) => page.finalUrl !== primaryPage.finalUrl)];
    }

    pages = pages.filter(sourceIsUseful).slice(0, MAX_EXTRA_PAGES + 2);
    let usefulChars = pages.reduce((sum, page) => sum + page.text.length, 0);

    // Dynamic/geo-restricted casino sites are common. Use one rendered map pass and
    // parallel scrapes instead of repeatedly guessing /bonus, /terms, /payments paths.
    let usedFirecrawl = false;
    if (firecrawlConfigured() && (usefulChars < 7000 || blockedPrimary || pages.length < 3)) {
      const firecrawlSeeds = [normalizedOfficialUrl, primaryResolution?.finalUrl]
        .filter((value): value is string => Boolean(value));
      const hostHint = (() => {
        try { return new URL(normalizedOfficialUrl || primaryResolution?.finalUrl || normalizedAffiliateUrl).hostname.replace(/^www\./, ""); } catch { return ""; }
      })();

      const [renderedPages, alternatePages, opaqueAffiliatePages] = await Promise.all([
        discoverRenderedSources(firecrawlSeeds),
        blockedPrimary && hostHint && !looksLikeTrackingHost(hostHint)
          ? discoverAlternateOfficialSources(hostHint, casinoNameHint)
          : Promise.resolve([] as PageSource[]),
        (blockedPrimary || looksLikeTrackingHost(hostHint))
          ? discoverFromOpaqueAffiliateUrl(normalizedAffiliateUrl, primaryResolution?.redirectChain || [])
          : Promise.resolve([] as PageSource[]),
      ]);

      if (renderedPages.length || alternatePages.length || opaqueAffiliatePages.length) {
        usedFirecrawl = true;
        const merged = [...opaqueAffiliatePages, ...alternatePages, ...renderedPages, ...pages];
        pages = merged
          .filter((page, index) => merged.findIndex((candidate) => candidate.finalUrl === page.finalUrl) === index)
          .filter(sourceIsUseful)
          .slice(0, MAX_EXTRA_PAGES + 7);
        usefulChars = pages.reduce((sum, page) => sum + page.text.length, 0);
      }
    }

    // Search is discovery-only. It is especially useful when the casino rejects the
    // Vercel/Firecrawl location but its official terms/promotions are indexed.
    if (firecrawlConfigured() && (usefulChars < 2600 || pages.filter((p) => p.text.length >= 500).length < 2)) {
      const hostHint = (() => {
        try { return new URL(normalizedOfficialUrl || primaryResolution?.finalUrl || normalizedAffiliateUrl).hostname.replace(/^www\./, ""); } catch { return ""; }
      })();
      if (hostHint && !looksLikeTrackingHost(hostHint)) {
        const searchQuery = blockedPrimary
          ? `"${hostHint}" official casino terms bonus promotions payments licence responsible gambling`
          : `site:${hostHint} official casino terms bonus promotions payments licence responsible gambling`;
        const searchPages = await firecrawlSearch(searchQuery, 6);
        const convertedAll: PageSource[] = searchPages.map((page) => ({
          url: page.url,
          finalUrl: page.finalUrl,
          title: page.title,
          description: page.description,
          canonical: page.canonical,
          ogImage: page.ogImage,
          icon: page.icon,
          brandLogo: page.brandLogo,
          text: page.markdown.slice(0, MAX_FETCH_CHARS),
        }));
        const searchBrandHint = casinoNameHint || inferBrandHintFromSearchHits(searchPages);
        const converted = convertedAll.filter((page) => {
          try {
            const pageHost = new URL(page.finalUrl).hostname.replace(/^www\./, "");
            if (pageHost === hostHint || pageHost.endsWith(`.${hostHint}`)) return true;
          } catch {}
          return Boolean(searchBrandHint && pageMatchesBrand(page, searchBrandHint));
        });
        const merged = [...converted, ...pages];
        pages = merged
          .filter((page, index) => merged.findIndex((candidate) => candidate.finalUrl === page.finalUrl) === index)
          .filter(sourceIsUseful)
          .slice(0, MAX_EXTRA_PAGES + 8);
        usefulChars = pages.reduce((sum, page) => sum + page.text.length, 0);
        if (converted.length) usedFirecrawl = true;
      }
    }

    if (!pages.length || usefulChars < MIN_USEFUL_SOURCE_CHARS) {
      // Do not turn a temporary geo/CAPTCHA block into a day of manual work. If the
      // tracking link resolved to a plausible casino origin, create a private candidate
      // that monitoring can retry. Nothing is public until evidence gates pass.
      if (normalizedOfficialUrl) {
        const host = new URL(normalizedOfficialUrl).hostname.replace(/^www\./, "");
        const fallbackName = casinoNameHint || host.split(".")[0].replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
        const draft = sanitizeDraft({
          name: fallbackName,
          slug: slugify(fallbackName),
          official_url: normalizedOfficialUrl,
          description: null,
          verification_status: "needs_review",
          ai_import_confidence: 10,
          suggested_offers: [],
        }, normalizedAffiliateUrl, normalizedOfficialUrl, null);
        draft.verification_status = "needs_review";
        draft.ai_import_status = "needs_review";
        draft.monitoring_status = "inaccessible";

        let existingCasinoId: string | null = null;
        const { data: byOfficial } = await supabase.from("casino").select("id").eq("official_url", normalizedOfficialUrl).maybeSingle();
        existingCasinoId = byOfficial?.id || null;
        if (!existingCasinoId) {
          const { data: bySlug } = await supabase.from("casino").select("id").eq("slug", draft.slug).maybeSingle();
          existingCasinoId = bySlug?.id || null;
        }

        return NextResponse.json({
          success: true,
          draft,
          meta: {
            model: "nivaro-private-candidate-v2",
            importStatus: "needs_review",
            confidence: 10,
            sourcesFetched: [],
            warnings: ["Destination access is temporarily limited. Saved privately; Nivaro Core will retry automatically."],
            durationMs: Date.now() - startedAt,
            extraction: usedFirecrawl ? "firecrawl-v2+private-candidate" : "private-candidate",
            existingCasinoId,
            sourceHealth: { pages: 0, usefulCharacters: 0, rendered: usedFirecrawl, strongPages: 0, accessLimited: blockedPrimary },
          },
        }, { status: 200 });
      }

      return NextResponse.json({
        success: false,
        error: "Smart Import could not resolve the casino identity safely from this tracking URL. The link was not saved or published.",
        meta: {
          importStatus: "needs_review",
          confidence: 0,
          sourcesFetched: [],
          durationMs: Date.now() - startedAt,
          extraction: usedFirecrawl ? "firecrawl-v2" : "direct",
        },
      }, { status: 422 });
    }

    const { draft, warnings: aiWarnings, model } = await callGemini(pages, normalizedAffiliateUrl);
    const assets = bestBrandAsset(pages);
    if (!draft.logo_url && assets.logo) draft.logo_url = assets.logo;
    if (!draft.cover_image_url && assets.cover) draft.cover_image_url = assets.cover;
    const warnings = [
      ...aiWarnings,
      ...(primaryError ? [`Affiliate URL resolver note: ${primaryError}`] : []),
      ...(blockedPrimary ? ["The affiliate destination limited access from the test location; alternate official sources were used where available."] : []),
      ...(casinoNameHint && !draft.name ? [`Casino name hint supplied: ${casinoNameHint}`] : []),
    ];
    const deterministicConfidence = calculateImportConfidence(draft, pages, warnings);
    draft.ai_import_confidence = Math.min(draft.ai_import_confidence ?? deterministicConfidence, deterministicConfidence);
    const criticalWarning = warnings.some((warning) => /conflict|identity mismatch|unable to resolve|no official|licen[cs]e conflict|operator mismatch/i.test(warning));
    if ((draft.ai_import_confidence ?? 0) < 70 || criticalWarning) {
      draft.verification_status = "needs_review";
      draft.ai_import_status = "needs_review";
    } else {
      // Import completeness is not legal approval. Market publication remains owned by
      // the deterministic regulator + affiliate permission engine.
      draft.verification_status = "pending";
      draft.ai_import_status = "completed";
    }

    let existingCasinoId: string | null = null;
    if (draft.slug) {
      const { data: existing } = await supabase.from("casino").select("id").eq("slug", draft.slug).maybeSingle();
      existingCasinoId = existing?.id || null;
    }
    if (!existingCasinoId && draft.official_url) {
      const { data: existing } = await supabase.from("casino").select("id,official_url").eq("official_url", draft.official_url).maybeSingle();
      existingCasinoId = existing?.id || null;
    }

    return NextResponse.json(
      {
        success: true,
        draft,
        meta: {
          model,
          importStatus: draft.ai_import_status,
          confidence: draft.ai_import_confidence,
          sourcesFetched: pages.map((page) => page.finalUrl),
          warnings,
          durationMs: Date.now() - startedAt,
          extraction: usedFirecrawl ? "firecrawl-v2+direct" : "direct",
          existingCasinoId,
          sourceHealth: {
            pages: pages.length,
            usefulCharacters: usefulChars,
            rendered: usedFirecrawl,
            strongPages: pages.filter((page) => page.text.length >= 500).length,
            accessLimited: blockedPrimary,
            resolvedDestination: primaryResolution?.finalUrl || null,
            redirectChain: primaryResolution?.redirectChain || [],
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Casino AI Import failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Casino AI Import failed.",
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }
}
