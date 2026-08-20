import { createHash } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { fetchPublicPage, htmlToText, normalizeHttpUrl } from "./net";
import { firecrawlConfigured, firecrawlMap, firecrawlScrape } from "./firecrawl";
import { syncBonusMarketCompliance } from "./compliance-engine";

const PATHS = ["/promotions", "/promotion", "/bonuses", "/bonus", "/offers", "/casino-bonus", "/welcome-bonus"];
const OFFER_URL_RE = /bonus|promo|offer|welcome|free[-_]?spin|cashback|reward/i;

function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90); }

function extractOffer(text: string, sourceUrl: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const percentAmount = clean.match(/(?:welcome\s+bonus[^.!?]{0,140})?((?:\d{1,3})%[^.!?]{0,120}(?:€|£|\$|C\$|CA\$)\s?[\d,.]+[^.!?]{0,120})/i);
  const amountSpins = clean.match(/((?:€|£|\$|C\$|CA\$)\s?[\d,.]+[^.!?]{0,100}(?:\d{1,4}\s+)?free\s+spins)/i);
  const spins = clean.match(/(\d{1,4})\s+free\s+spins/i);
  const promo = clean.match(/(?:promo(?:tion)?|bonus)\s*code\s*[:\-]?\s*([A-Z0-9_-]{3,30})/i);
  const wagering = clean.match(/(?:wager(?:ing)?|playthrough)(?:\s+requirement)?\s*[:\-]?\s*(\d{1,3})\s*[x×]/i);
  const minDeposit = clean.match(/(?:minimum|min\.?)[\s-]+deposit\s*[:\-]?\s*((?:€|£|\$|C\$|CA\$)\s?[\d,.]+)/i);
  const maxCashout = clean.match(/(?:maximum|max\.?)[\s-]+(?:cashout|withdrawal)\s*[:\-]?\s*((?:€|£|\$|C\$|CA\$)\s?[\d,.]+)/i);
  const phrase = percentAmount?.[1] || amountSpins?.[1] || (spins ? `${spins[1]} Free Spins` : null) || (promo ? `Promo code ${promo[1]}` : null);
  if (!phrase) return null;
  let confidence = (percentAmount || amountSpins ? 45 : 20) + (spins ? 15 : 0) + (promo ? 10 : 0) + (wagering ? 10 : 0) + (minDeposit ? 10 : 0) + (OFFER_URL_RE.test(sourceUrl) ? 10 : 0);
  confidence = Math.min(98, confidence);
  if (confidence < 55) return null;
  return {
    type: promo ? "promo_code" : "welcome",
    title: phrase.slice(0, 280),
    amount: percentAmount?.[1]?.slice(0, 500) || amountSpins?.[1]?.slice(0, 500) || null,
    free_spins: spins ? `${spins[1]} Free Spins` : null,
    free_spins_count: spins ? Number(spins[1]) : null,
    promo_code: promo?.[1] || null,
    wagering_requirement: wagering ? `${wagering[1]}x` : null,
    min_deposit: minDeposit?.[1] || null,
    max_cashout: maxCashout?.[1] || null,
    source_url: sourceUrl,
    confidence,
  };
}

async function collectPromotionPages(origin: string) {
  const pages = new Map<string, string>();

  // Direct checks run concurrently so a few 404/geo-blocked paths cannot make a save
  // wait close to a minute. Any failed path is simply ignored.
  const directResults = await Promise.allSettled(PATHS.map(async (path) => {
    const page = await fetchPublicPage(new URL(path, origin).toString(), { timeoutMs: 5500, maxRedirects: 3 });
    const text = htmlToText(page.body);
    return { url: page.finalUrl, text };
  }));
  for (const result of directResults) {
    if (result.status !== "fulfilled") continue;
    const { url, text } = result.value;
    if (text.length > 250 && OFFER_URL_RE.test(`${url} ${text.slice(0, 1600)}`)) pages.set(url, text);
  }

  if (firecrawlConfigured()) {
    try {
      // One site map request, then local URL ranking and parallel rendered scrapes.
      const mapped = await firecrawlMap(origin, undefined, 60);
      const candidates = mapped
        .filter((url) => OFFER_URL_RE.test(url))
        .sort((a, b) => {
          const score = (url: string) => /bonus|promotion|promo|offer|welcome/i.test(url) ? 2 : /free[-_]?spin|cashback|reward/i.test(url) ? 1 : 0;
          return score(b) - score(a);
        })
        .slice(0, 6);
      const rendered = await Promise.allSettled(candidates.map((url) => firecrawlScrape(url)));
      for (const result of rendered) {
        if (result.status !== "fulfilled" || !result.value?.markdown) continue;
        if (result.value.markdown.length > 250) pages.set(result.value.finalUrl, result.value.markdown);
      }
      if (!pages.size) {
        const home = await firecrawlScrape(origin);
        if (home?.markdown && OFFER_URL_RE.test(home.markdown)) pages.set(home.finalUrl, home.markdown);
      }
    } catch {}
  }

  return [...pages.entries()].map(([url, text]) => ({ url, text }));
}

export async function refreshCasinoOffers(casinoId: string) {
  const supabase = await createSupabaseServiceClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  const { data: casino } = await supabase.from("casino").select("id,name,slug,official_url,affiliate_url").eq("id", casinoId).single();
  if (!casino) throw new Error("Casino not found.");
  const base = normalizeHttpUrl(casino.official_url || casino.affiliate_url);
  if (!base) return { found: 0, changed: 0, pages: 0 };
  const origin = new URL(base).origin;
  const pages = await collectPromotionPages(origin);

  const offers = pages.map((p) => extractOffer(p.text, p.url)).filter(Boolean) as NonNullable<ReturnType<typeof extractOffer>>[];
  const dedup = new Map<string, typeof offers[number]>();
  for (const offer of offers) dedup.set(`${offer.type}:${offer.promo_code || ""}:${offer.title.toLowerCase().slice(0,100)}`, offer);
  let changed = 0;
  const now = new Date().toISOString();
  const seenBonusIds = new Set<string>();

  for (const offer of [...dedup.values()].slice(0, 12)) {
    const sourceHash = hash(JSON.stringify(offer));
    const { data: existing } = await supabase.from("bonus").select("*").eq("casino_id", casinoId).eq("source_url", offer.source_url).eq("type", offer.type).maybeSingle();
    const status = offer.confidence >= 80 ? "active" : "needs_review";
    const payload = {
      casino_id: casinoId,
      slug: `${casino.slug}-${slugify(offer.title)}-${sourceHash.slice(0,8)}`,
      type: offer.type,
      title: offer.title,
      amount: offer.amount,
      free_spins: offer.free_spins,
      free_spins_count: offer.free_spins_count,
      promo_code: offer.promo_code,
      wagering_requirement: offer.wagering_requirement,
      min_deposit: offer.min_deposit,
      max_cashout: offer.max_cashout,
      terms_url: offer.source_url,
      source: "Official casino promotion page",
      source_url: offer.source_url,
      verified_at: offer.confidence >= 90 ? now : null,
      last_checked_at: now,
      status,
      active: true,
      updated_at: now,
    };
    if (existing?.id) {
      seenBonusIds.add(existing.id);
      const before = JSON.stringify({title:existing.title,amount:existing.amount,promo_code:existing.promo_code,wagering_requirement:existing.wagering_requirement,min_deposit:existing.min_deposit,max_cashout:existing.max_cashout});
      const after = JSON.stringify({title:payload.title,amount:payload.amount,promo_code:payload.promo_code,wagering_requirement:payload.wagering_requirement,min_deposit:payload.min_deposit,max_cashout:payload.max_cashout});
      await supabase.from("bonus").update(payload).eq("id", existing.id);
      if (before !== after) {
        changed++;
        await supabase.from("entity_change_history").insert({ entity_type:"bonus", entity_id:existing.id, casino_id:casinoId, field_name:"offer_snapshot", old_value:JSON.parse(before), new_value:JSON.parse(after), source_url:offer.source_url, source_type:"official_offer", detected_by:"system", confidence:offer.confidence, status:offer.confidence>=90?"auto_applied":"pending_review", applied_at:offer.confidence>=90?now:null });
      }
    } else {
      const { data: inserted } = await supabase.from("bonus").insert({ ...payload, created_at: now }).select("id").single();
      if (inserted?.id) { seenBonusIds.add(inserted.id); changed++; }
    }
  }

  // Never deactivate offers after an incomplete crawl. Only age out an unseen offer when we had multiple healthy offer pages.
  if (pages.length >= 2) {
    const { data: current } = await supabase.from("bonus").select("id,last_checked_at,source_url").eq("casino_id", casinoId).eq("active", true);
    for (const old of current || []) {
      if (seenBonusIds.has(old.id)) continue;
      const age = old.last_checked_at ? Date.now() - new Date(old.last_checked_at).getTime() : Infinity;
      if (age > 72 * 60 * 60 * 1000) {
        await supabase.from("bonus").update({ status: "needs_review", active: false, updated_at: now }).eq("id", old.id);
      }
    }
  }

  await syncBonusMarketCompliance(casinoId);
  return { found: dedup.size, changed, pages: pages.length };
}
