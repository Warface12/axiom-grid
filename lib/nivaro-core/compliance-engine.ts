import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { ACTIVE_MARKETS, MARKET_RULES, type MarketCode } from "./markets";
import { normalizeDomain } from "./net";

type AffiliatePermission = { market: MarketCode; approved: boolean; termsUrl?: string | null; note?: string | null };

function affiliatePermissionFromCasino(casino: any, market: MarketCode): AffiliatePermission {
  // Partner-side GEO permission must be explicit. Legacy country tags are never accepted as legal approval.
  const notes = casino?.ai_import_notes && typeof casino.ai_import_notes === "object" ? casino.ai_import_notes : {};
  const permissions = Array.isArray(notes?.affiliate_market_permissions) ? notes.affiliate_market_permissions : [];
  const hit = permissions.find((item: any) => String(item?.market || "").toLowerCase() === market);
  if (hit?.approved === true) {
    return { market, approved: true, termsUrl: typeof hit?.terms_url === "string" ? hit.terms_url : null, note: typeof hit?.note === "string" ? hit.note : "Explicit partner GEO permission stored." };
  }

  // A GEO-looking token inside a tracking URL is discovery evidence only, never legal/contractual approval.
  // Approval requires explicit partner/network evidence stored by a trusted adapter or reviewed source.
  return { market, approved: false, termsUrl: null, note: "Affiliate GEO permission not explicitly proven." };
}

function normalizeEntityName(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(limited|ltd|plc|inc|llc|corp|corporation|company|co|gaming|gambling|casino|online)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function entityNamesMatch(casino: any, registryEntry: any) {
  const casinoNames = [casino?.owner_name, casino?.name].map(normalizeEntityName).filter((v)=>v.length >= 3);
  const registryNames = [registryEntry?.operator_name, registryEntry?.trading_name].map(normalizeEntityName).filter((v)=>v.length >= 3);
  for (const a of casinoNames) for (const b of registryNames) {
    if (a === b) return true;
    if (a.length >= 6 && b.length >= 6 && (a.includes(b) || b.includes(a))) return true;
  }
  return false;
}

export async function evaluateCasinoMarkets(casinoId: string) {
  const supabase = await createSupabaseServiceClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  const { data: casino, error } = await supabase.from("casino").select("*").eq("id", casinoId).single();
  if (error || !casino) throw new Error(error?.message || "Casino not found.");

  const domain = normalizeDomain(casino.official_url) || normalizeDomain(casino.affiliate_url);
  const now = new Date();
  const nextCheck = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const results: any[] = [];

  for (const market of ACTIVE_MARKETS) {
    const rule = MARKET_RULES[market];
    let registryEntry: any = null;
    if (domain) {
      const { data } = await supabase
        .from("market_registry_entry")
        .select("*")
        .eq("market_code", market)
        .eq("domain", domain)
        .eq("active", true)
        .maybeSingle();
      registryEntry = data;
    }

    const affiliate = affiliatePermissionFromCasino(casino, market);
    const exactDomainMatch = Boolean(registryEntry?.domain && registryEntry.domain === domain);
    const exactOperatorMatch = exactDomainMatch && entityNamesMatch(casino, registryEntry);
    const regulatorCurrent = Boolean(registryEntry?.last_checked_at && Date.now() - new Date(registryEntry.last_checked_at).getTime() <= 8 * 24 * 60 * 60 * 1000);
    const operatorLicensed = exactDomainMatch && exactOperatorMatch && regulatorCurrent;
    const affiliateApproved = !rule.requiresAffiliatePermission || affiliate.approved;
    const fullyApproved = operatorLicensed && affiliateApproved;
    const status = fullyApproved ? "approved" : operatorLicensed && !affiliateApproved ? "needs_legal_review" : "blocked";

    const payload = {
      casino_id: casinoId,
      market_code: market,
      status,
      operator_licensed: operatorLicensed,
      affiliate_marketing_approved: affiliateApproved,
      bonus_public_advertising_allowed: fullyApproved && rule.bonusPublicPromotionDefault,
      listing_allowed: fullyApproved,
      review_allowed: fullyApproved,
      affiliate_cta_allowed: fullyApproved,
      seo_index_allowed: fullyApproved,
      exact_domain_match: exactDomainMatch,
      exact_operator_match: exactOperatorMatch,
      registry_status: regulatorCurrent ? "current" : registryEntry ? "stale" : "not_found",
      evidence_confidence: fullyApproved ? 100 : operatorLicensed ? 70 : 0,
      regulator_name: rule.regulatorName,
      regulator_source_url: registryEntry?.source_record_url || rule.registryUrl,
      partner_terms_url: affiliate.termsUrl || null,
      evidence_notes: fullyApproved
        ? "Exact official registry domain/operator match and explicit affiliate GEO permission confirmed."
        : !operatorLicensed
          ? "Fail-closed: no current exact domain + operator match in the official market registry."
          : "Fail-closed: regulator match exists but affiliate permission for this market is not explicitly confirmed.",
      reviewed_at: fullyApproved ? now.toISOString() : null,
      reviewed_by: fullyApproved ? "nivaro-core" : null,
      last_checked_at: now.toISOString(),
      next_check_at: nextCheck,
      last_error: null,
      updated_at: now.toISOString(),
    };

    await supabase.from("casino_market_compliance").upsert(payload, { onConflict: "casino_id,market_code" });
    await supabase.from("evidence_snapshot").insert({
      casino_id: casinoId,
      market_code: market,
      evidence_type: "market_eligibility",
      field_key: "listing_allowed",
      source_kind: "regulator",
      source_url: registryEntry?.source_record_url || rule.registryUrl,
      source_title: rule.regulatorName,
      extracted_value: { domain, registry_domain_match: exactDomainMatch, registry_operator_match: exactOperatorMatch, affiliate_permission: affiliateApproved, result: status },
      status: fullyApproved ? "current" : registryEntry ? "conflict" : "current",
      confidence: payload.evidence_confidence,
      checked_at: now.toISOString(),
      expires_at: nextCheck,
    });
    results.push({ market, ...payload });
  }

  // Global visible is derived from market eligibility, never from an importer/manual checkbox.
  // A casino becomes publicly visible only when at least one supported market is fully approved.
  const anyApproved = results.some((item) => item.status === "approved" && item.listing_allowed === true);
  await supabase.from("casino").update({
    visible: anyApproved,
    updated_at: now.toISOString(),
  }).eq("id", casinoId);

  return results;
}

export async function evaluateAllCasinoMarkets(limit = 250) {
  const supabase = await createSupabaseServiceClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  const { data } = await supabase.from("casino").select("id").eq("active", true).limit(limit);
  const results = [];
  for (const row of data || []) {
    try { results.push({ casinoId: row.id, markets: await evaluateCasinoMarkets(row.id) }); }
    catch (error) { results.push({ casinoId: row.id, error: error instanceof Error ? error.message : "Failed" }); }
  }
  return results;
}

export async function syncBonusMarketCompliance(casinoId: string) {
  const supabase = await createSupabaseServiceClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  const { data: bonuses } = await supabase.from("bonus").select("id").eq("casino_id", casinoId).eq("active", true);
  const { data: markets } = await supabase.from("casino_market_compliance").select("*").eq("casino_id", casinoId);
  const now = new Date().toISOString();
  for (const bonus of bonuses || []) {
    for (const market of ACTIVE_MARKETS) {
      const casinoMarket = (markets || []).find((item: any) => item.market_code === market);
      const publicAllowed = casinoMarket?.status === "approved" && casinoMarket?.bonus_public_advertising_allowed === true;
      await supabase.from("bonus_market_compliance").upsert({
        bonus_id: bonus.id,
        market_code: market,
        status: publicAllowed ? "approved" : casinoMarket?.status === "approved" ? "blocked" : "blocked",
        public_promotion_allowed: publicAllowed,
        affiliate_cta_allowed: publicAllowed && casinoMarket?.affiliate_cta_allowed === true,
        evidence_notes: publicAllowed ? "Offer publication explicitly allowed by the market rule." : "Fail-closed: public bonus promotion is not explicitly approved for this market.",
        regulator_source_url: MARKET_RULES[market].registryUrl,
        last_checked_at: now,
        next_check_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        updated_at: now,
      }, { onConflict: "bonus_id,market_code" });
    }
  }

  const { data: promoCodes } = await supabase.from("promo_code").select("id").eq("casino_id", casinoId).eq("active", true);
  for (const promo of promoCodes || []) {
    for (const market of ACTIVE_MARKETS) {
      const casinoMarket = (markets || []).find((item: any) => item.market_code === market);
      const publicAllowed = casinoMarket?.status === "approved" && casinoMarket?.bonus_public_advertising_allowed === true;
      await supabase.from("promo_code_market_compliance").upsert({
        promo_code_id: promo.id, market_code: market, status: publicAllowed ? "approved" : "blocked",
        public_promotion_allowed: publicAllowed, affiliate_cta_allowed: publicAllowed && casinoMarket?.affiliate_cta_allowed === true,
        evidence_notes: publicAllowed ? "Promo publication explicitly allowed by the market rule." : "Fail-closed: public promo-code promotion is not explicitly approved for this market.",
        last_checked_at: now, next_check_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), updated_at: now,
      }, { onConflict: "promo_code_id,market_code" });
    }
  }
 }
