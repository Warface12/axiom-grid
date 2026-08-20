import { lookup } from "dns/promises";
import net from "net";

export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
    const url = new URL(candidate);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function normalizeHttpUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function isPrivateAddress(address: string) {
  const lower = address.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || a >= 224) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  if (net.isIPv6(address)) {
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(lower)) return true;
  }
  return false;
}

export async function assertPublicUrl(raw: string) {
  const normalized = normalizeHttpUrl(raw);
  if (!normalized) throw new Error("Invalid public URL.");
  const url = new URL(normalized);
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) throw new Error("Private/local URLs are not allowed.");
  const records = await lookup(host, { all: true, verbatim: true });
  if (!records.length || records.some((item) => isPrivateAddress(item.address))) {
    throw new Error("Private/internal addresses are not allowed.");
  }
  return url;
}

export async function fetchPublicPage(raw: string, options?: { timeoutMs?: number; maxRedirects?: number }) {
  let current = (await assertPublicUrl(raw)).toString();
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const maxRedirects = options?.maxRedirects ?? 8;

  for (let index = 0; index <= maxRedirects; index++) {
    await assertPublicUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "user-agent": "NivaroBot/1.0 (+https://nivarobet.best/how-we-verify)",
          accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error(`Redirect without Location (${response.status}).`);
        current = new URL(location, current).toString();
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        finalUrl: current,
        contentType: response.headers.get("content-type") || "",
        body: await response.text(),
        etag: response.headers.get("etag"),
        lastModified: response.headers.get("last-modified"),
      };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("Too many redirects.");
}

export function extractLinks(html: string, baseUrl: string) {
  const links = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>/gi)) {
    try {
      const url = new URL(match[1], baseUrl);
      if (url.protocol === "http:" || url.protocol === "https:") {
        url.hash = "";
        links.add(url.toString());
      }
    } catch {}
  }
  return [...links];
}

export function htmlToText(html: string) {
  return html
    .replace(/<!--[^]*?-->/g, " ")
    .replace(/<script\b[^>]*>[^]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[^]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
