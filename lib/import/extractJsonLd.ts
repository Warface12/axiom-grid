type JsonLd = Record<string, unknown>;

function asRecord(value: unknown): JsonLd | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonLd : null;
}

function flatten(node: unknown, out: JsonLd[]) {
  if (Array.isArray(node)) {
    for (const item of node) flatten(item, out);
    return;
  }
  const rec = asRecord(node);
  if (!rec) return;
  out.push(rec);
  if (rec["@graph"]) flatten(rec["@graph"], out);
}

function typeOf(rec: JsonLd) {
  const t = rec["@type"];
  if (Array.isArray(t)) return t.map(String).join(" ").toLowerCase();
  return String(t || "").toLowerCase();
}

function str(value: unknown): string {
  if (typeof value === "string") return value.trim();
  const rec = asRecord(value);
  if (rec && typeof rec.name === "string") return rec.name.trim();
  if (rec && typeof rec.url === "string") return rec.url.trim();
  return "";
}

export type JsonLdEvidence = {
  name: string | null;
  description: string | null;
  url: string | null;
  logo: string | null;
  types: string[];
};

export function extractJsonLd(html: string): JsonLdEvidence {
  const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const nodes: JsonLd[] = [];
  for (const tag of scripts) {
    const body = tag.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    try {
      flatten(JSON.parse(body), nodes);
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  const preferred = nodes.find((n) => /organization|softwareapplication|webapplication|product/.test(typeOf(n)))
    || nodes.find((n) => /website/.test(typeOf(n)));
  if (!preferred) return { name: null, description: null, url: null, logo: null, types: [] };
  const logo = str(asRecord(preferred.logo)?.url) || str(preferred.logo) || str(asRecord(preferred.image)?.url);
  return {
    name: str(preferred.name) || null,
    description: str(preferred.description) || null,
    url: str(preferred.url) || null,
    logo: logo || null,
    types: nodes.map(typeOf).filter(Boolean).slice(0, 8),
  };
}
