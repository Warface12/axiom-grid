export function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return (match?.[2] || match?.[3] || match?.[4] || "").trim();
}

export function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return "";
}

export function collectMeta(html: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const map = new Map<string, string>();
  for (const tag of tags) {
    const key = (attr(tag, "property") || attr(tag, "name") || attr(tag, "itemprop")).toLowerCase();
    const content = decodeHtml(attr(tag, "content"));
    if (key && content && !map.has(key)) map.set(key, content);
  }
  return map;
}

export function collectIcons(html: string, base: URL) {
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
