import { createHash } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { ACTIVE_MARKETS, MARKET_RULES, type MarketCode } from "./markets";
import { extractLinks, fetchPublicPage, htmlToText, normalizeDomain } from "./net";
import { firecrawlScrape } from "./firecrawl";

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function looksLikeOperatorDetail(url: string, regulatorHost: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.toLowerCase().includes(regulatorHost)) return false;
    const path = parsed.pathname.toLowerCase();
    return /operator|licen[cs]|register|business|brand|website/.test(path);
  } catch {
    return false;
  }
}

function externalDomainsFromPage(html: string, baseUrl: string, regulatorHost: string) {
  const domains = new Set<string>();
  for (const link of extractLinks(html, baseUrl)) {
    try {
      const url = new URL(link);
      const domain = normalizeDomain(link);
      if (!domain) continue;
      if (url.hostname.toLowerCase().includes(regulatorHost)) continue;
      if (/facebook|twitter|x\.com|linkedin|instagram|youtube|google|apple|microsoft|cloudflare/.test(domain)) continue;
      domains.add(domain);
    } catch {}
  }
  return [...domains];
}

function titleFromHtml(html: string) {
  const title = html.match(/<title[^>]*>([^]*?)<\/title>/i)?.[1];
  return title ? htmlToText(title).slice(0, 240) : null;
}

async function renderedText(url: string): Promise<string | null> {
  const page = await firecrawlScrape(url);
  if (!page) return null;
  return `${page.markdown}
${page.links.join("\n")}`.trim() || null;
}

export async function syncOfficialRegistry(market: MarketCode) {
  const rule = MARKET_RULES[market];
  const supabase = await createSupabaseServiceClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");

  const started = new Date().toISOString();
  const { data: run } = await supabase
    .from("market_registry_sync")
    .insert({ market_code: market, regulator_name: rule.regulatorName, source_url: rule.registryUrl, status: "running", started_at: started })
    .select("id")
    .single();

  let entriesSeen = 0;
  let entriesChanged = 0;
  try {
    const index = await fetchPublicPage(rule.registryUrl, { timeoutMs: 20_000 });
    const indexHash = hash(index.body);
    const indexLinks = extractLinks(index.body, index.finalUrl);
    const candidateInternal = indexLinks
      .filter((url) => looksLikeOperatorDetail(url, rule.regulatorHost))
      .slice(0, 180);

    const pageRecords: Array<{ sourceUrl: string; title: string | null; body: string }> = [
      { sourceUrl: index.finalUrl, title: titleFromHtml(index.body), body: index.body },
    ];

    // Detail pages improve exact-domain discovery when the registry index only lists operator names.
    // Fetch in bounded parallel batches so an official registry with many detail pages cannot
    // consume the whole cron window one URL at a time.
    const detailUrls = candidateInternal.slice(0, 60);
    const concurrency = 8;
    for (let offset = 0; offset < detailUrls.length; offset += concurrency) {
      const batch = detailUrls.slice(offset, offset + concurrency);
      const results = await Promise.allSettled(batch.map((url) =>
        fetchPublicPage(url, { timeoutMs: 7_000, maxRedirects: 4 })
      ));
      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        const detail = result.value;
        pageRecords.push({ sourceUrl: detail.finalUrl, title: titleFromHtml(detail.body), body: detail.body });
      }
    }

    const discovered = new Map<string, { operator: string | null; sourceUrl: string; sourceHash: string }>();
    for (const page of pageRecords) {
      const pageHash = hash(page.body);
      for (const domain of externalDomainsFromPage(page.body, page.sourceUrl, rule.regulatorHost)) {
        discovered.set(domain, { operator: page.title, sourceUrl: page.sourceUrl, sourceHash: pageHash });
      }
    }

    // Rendered fallback is discovery-only and still anchored to the official regulator URL.
    if (discovered.size === 0) {
      const rendered = await renderedText(rule.registryUrl);
      if (rendered) {
        const urlRegex = /https?:\/\/[^\s)\]}>"']+/gi;
        for (const raw of rendered.match(urlRegex) || []) {
          const domain = normalizeDomain(raw);
          if (!domain || domain.includes(rule.regulatorHost)) continue;
          if (/facebook|twitter|x\.com|linkedin|instagram|youtube|google/.test(domain)) continue;
          discovered.set(domain, { operator: null, sourceUrl: rule.registryUrl, sourceHash: hash(rendered) });
        }
      }
    }

    const now = new Date().toISOString();
    for (const [domain, entry] of discovered) {
      entriesSeen++;
      const { data: existing } = await supabase
        .from("market_registry_entry")
        .select("id,active,source_hash,operator_name")
        .eq("market_code", market)
        .eq("domain", domain)
        .maybeSingle();

      const payload = {
        market_code: market,
        operator_name: entry.operator,
        trading_name: entry.operator,
        domain,
        regulator_name: rule.regulatorName,
        regulator_source_url: rule.registryUrl,
        source_record_url: entry.sourceUrl,
        active: true,
        source_hash: entry.sourceHash,
        last_seen_at: now,
        last_checked_at: now,
      };

      const { error } = existing?.id
        ? await supabase.from("market_registry_entry").update(payload).eq("id", existing.id)
        : await supabase.from("market_registry_entry").insert({ ...payload, first_seen_at: now });
      if (!error && (!existing || existing.source_hash !== entry.sourceHash || existing.active === false)) entriesChanged++;
    }

    // Never infer removal from a partial/empty scrape. Only mark unseen entries inactive after a healthy discovery.
    if (discovered.size >= 3) {
      const domains = [...discovered.keys()];
      const { data: currentEntries } = await supabase.from("market_registry_entry").select("id,domain").eq("market_code", market).eq("active", true);
      for (const current of currentEntries || []) {
        if (!domains.includes(current.domain)) {
          await supabase.from("market_registry_entry").update({ active: false, last_checked_at: now }).eq("id", current.id);
          entriesChanged++;
        }
      }
    }

    if (run?.id) {
      await supabase.from("market_registry_sync").update({
        status: discovered.size ? "success" : "partial",
        entries_seen: entriesSeen,
        entries_changed: entriesChanged,
        source_hash: indexHash,
        finished_at: now,
        error: discovered.size ? null : "No operator domains were discovered from the official registry; existing approvals remain fail-closed/stale until review.",
      }).eq("id", run.id);
    }
    return { market, entriesSeen, entriesChanged, status: discovered.size ? "success" : "partial" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registry sync failed.";
    if (run?.id) await supabase.from("market_registry_sync").update({ status: "failed", error: message, finished_at: new Date().toISOString() }).eq("id", run.id);
    return { market, entriesSeen, entriesChanged, status: "failed", error: message };
  }
}

export async function syncAllOfficialRegistries() {
  const settled = await Promise.allSettled(ACTIVE_MARKETS.map((market) => syncOfficialRegistry(market)));
  return settled.map((result, index) => result.status === "fulfilled"
    ? result.value
    : { market: ACTIVE_MARKETS[index], entriesSeen: 0, entriesChanged: 0, status: "failed", error: result.reason instanceof Error ? result.reason.message : "Registry sync failed." });
}
