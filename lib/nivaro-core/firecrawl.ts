export type FirecrawlPage = {
  url: string;
  finalUrl: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogImage: string | null;
  icon: string | null;
  markdown: string;
  links: string[];
  brandLogo: string | null;
};

const API_BASE = "https://api.firecrawl.dev/v2";
const DEFAULT_TIMEOUT_MS = 4_800;

function apiKey() {
  return process.env.FIRECRAWL_API_KEY?.trim() || null;
}

async function post<T>(path: string, body: unknown, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return (await response.json().catch(() => null)) as T | null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function text(value: unknown, max = 100_000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function url(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

export function firecrawlConfigured() {
  return Boolean(apiKey());
}

export type FirecrawlSearchHit = {
  url: string;
  title: string | null;
  description: string | null;
};

export async function firecrawlSearchLinks(query: string, limit = 6): Promise<FirecrawlSearchHit[]> {
  const payload: any = await post("/search", { query, limit }, 5_000);
  const items = payload?.data ?? payload?.results ?? [];
  if (!Array.isArray(items)) return [];
  const out: FirecrawlSearchHit[] = [];
  for (const item of items) {
    const itemUrl = url(item?.url || item?.metadata?.sourceURL);
    if (!itemUrl) continue;
    out.push({
      url: itemUrl,
      title: text(item?.title || item?.metadata?.title, 500) || null,
      description: text(item?.description || item?.metadata?.description, 1500) || null,
    });
  }
  return out;
}

function looksAccessLimited(page: FirecrawlPage | null) {
  if (!page) return true;
  const haystack = `${page.title || ""} ${page.description || ""} ${page.markdown.slice(0, 8000)}`.toLowerCase();
  return [
    "access denied",
    "forbidden",
    "not available in your country",
    "not available in your region",
    "restricted country",
    "restricted region",
    "geo restriction",
    "prohibited in your country",
    "checking your browser",
    "captcha",
  ].some((signal) => haystack.includes(signal));
}

function parseScrapePayload(rawUrl: string, payload: any): FirecrawlPage | null {
  if (!payload?.success && !payload?.data) return null;
  const data = payload?.data ?? payload;
  const metadata = data?.metadata ?? {};
  const branding = data?.branding ?? {};
  const finalUrl = url(metadata?.sourceURL || metadata?.url || rawUrl) || rawUrl;
  const links = Array.isArray(data?.links)
    ? data.links.map((item: any) => typeof item === "string" ? item : item?.url).filter(Boolean)
    : [];
  const brandLogo = url(
    branding?.logo ||
    branding?.images?.logo ||
    branding?.images?.favicon ||
    branding?.images?.ogImage ||
    metadata?.logo
  );
  return {
    url: rawUrl,
    finalUrl,
    title: text(metadata?.title, 500) || null,
    description: text(metadata?.description, 1500) || null,
    canonical: url(metadata?.canonicalUrl || metadata?.canonical),
    ogImage: url(metadata?.ogImage || metadata?.image || branding?.images?.ogImage),
    icon: url(metadata?.favicon || branding?.images?.favicon),
    markdown: text(data?.markdown),
    links,
    brandLogo,
  };
}

async function scrapeAtLocation(rawUrl: string, country: string, language: string): Promise<FirecrawlPage | null> {
  const payload: any = await post("/scrape", {
    url: rawUrl,
    formats: ["markdown", "links", "branding"],
    onlyMainContent: false,
    removeBase64Images: true,
    waitFor: 150,
    timeout: 8_000,
    proxy: "auto",
    maxAge: 86_400_000,
    location: { country, languages: [language] },
  }, 4_800);
  return parseScrapePayload(rawUrl, payload);
}

export async function firecrawlScrape(rawUrl: string): Promise<FirecrawlPage | null> {
  // Gambling brands frequently GEO-block data-centre traffic. Probe a small, diverse
  // set of NivaroBet-relevant locations in parallel so one blocked country never
  // serially stalls the entire import.
  const probes = await Promise.all([
    scrapeAtLocation(rawUrl, "GB", "en-GB"),
    scrapeAtLocation(rawUrl, "CA", "en-CA"),
    scrapeAtLocation(rawUrl, "DE", "de-DE"),
  ]);

  const readable = probes.filter((page): page is FirecrawlPage => Boolean(page) && !looksAccessLimited(page));
  if (readable.length) {
    return readable.sort((a, b) => (b.markdown.length - a.markdown.length))[0];
  }

  // A blocked response is evidence, not identity. Returning the richest one lets the
  // caller record the restriction while the independent search/registry pipeline
  // continues discovering official sources.
  const candidates = probes.filter(Boolean) as FirecrawlPage[];
  return candidates.sort((a, b) => (b.markdown.length - a.markdown.length))[0] || null;
}

export async function firecrawlMap(rawUrl: string, search?: string, limit = 30): Promise<string[]> {
  const payload: any = await post("/map", {
    url: rawUrl,
    ...(search ? { search } : {}),
    sitemap: "include",
    ignoreQueryParameters: true,
    limit,
  });
  const links = payload?.data?.links ?? payload?.links ?? [];
  if (!Array.isArray(links)) return [];
  const out: string[] = [];
  for (const item of links) {
    const candidate = url(typeof item === "string" ? item : item?.url);
    if (candidate && !out.includes(candidate)) out.push(candidate);
  }
  return out.slice(0, limit);
}

export async function firecrawlSearch(query: string, limit = 8): Promise<FirecrawlPage[]> {
  const payload: any = await post("/search", {
    query,
    limit,
    scrapeOptions: {
      formats: ["markdown"],
      onlyMainContent: true,
    },
  }, 6_500);
  const items = payload?.data ?? payload?.results ?? [];
  if (!Array.isArray(items)) return [];
  const out: FirecrawlPage[] = [];
  for (const item of items) {
    const itemUrl = url(item?.url || item?.metadata?.sourceURL);
    if (!itemUrl) continue;
    out.push({
      url: itemUrl,
      finalUrl: itemUrl,
      title: text(item?.title || item?.metadata?.title, 500) || null,
      description: text(item?.description || item?.metadata?.description, 1500) || null,
      canonical: url(item?.metadata?.canonicalUrl),
      ogImage: url(item?.metadata?.ogImage),
      icon: url(item?.metadata?.favicon),
      markdown: text(item?.markdown),
      links: [],
      brandLogo: null,
    });
  }
  return out;
}
