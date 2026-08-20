import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
  isSupabaseConfigured,
} from "./supabase/server";

import { getVisitorMarket, isOwnerPreview, publicMarketFilter } from "./compliance";

import type {
  Casino,
  Bonus,
  Guide,
  SportMatch,
  SportCategory,
  SearchResults,
  AdminAnalytics,
  PromoCode,
} from "./types";

async function createDataClient() {
  const serviceClient = await createSupabaseServiceClient();

  if (serviceClient) {
    return serviceClient;
  }

  return await createSupabaseServerClient();
}

/* =========================================================
   CASINOS — fail-closed market filtering
========================================================= */

async function resolveRequestedMarket(filters?: { countryCode?: string; regionCode?: string }) {
  const ownerPreview = await isOwnerPreview();
  if (filters?.countryCode || filters?.regionCode) {
    const { marketCodeFromFilters } = await import("./compliance");
    return { ownerPreview, market: marketCodeFromFilters(filters.countryCode, filters.regionCode) };
  }
  return { ownerPreview, market: ownerPreview ? null : await getVisitorMarket() };
}

export async function getCasinos(filters?: {
  search?: string;
  noDeposit?: boolean;
  freeSpins?: boolean;
  crypto?: boolean;
  limit?: number;
  countryCode?: string;
  regionCode?: string;
  offset?: number;
}): Promise<Casino[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createDataClient();
  const { ownerPreview, market } = await resolveRequestedMarket(filters);
  if (!ownerPreview && !market) return [];
  if ((filters?.countryCode || filters?.regionCode) && !market) return [];

  let query = market
    ? supabase
        .from("casino")
        .select("*, market_compliance:casino_market_compliance!inner(market_code,status,listing_allowed,review_allowed,affiliate_cta_allowed,bonus_public_advertising_allowed,seo_index_allowed,evidence_confidence,last_checked_at)")
        .eq("market_compliance.market_code", market)
        .eq("market_compliance.status", "approved")
        .eq("market_compliance.listing_allowed", true)
    : supabase.from("casino").select("*");

  query = query
    .eq("active", true)
    .eq("visible", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("rating", { ascending: false });

  if (filters?.noDeposit) query = query.eq("no_deposit", true);
  if (filters?.freeSpins) query = query.eq("free_spins", true);
  if (filters?.crypto) query = query.eq("crypto", true);
  if (filters?.search?.trim()) {
    const search = filters.search.trim();
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,welcome_bonus.ilike.%${search}%`);
  }
  if (filters?.offset && filters?.limit) query = query.range(filters.offset, filters.offset + filters.limit - 1);
  else if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) {
    console.error("getCasinos:", error.message);
    return [];
  }
  return (data || []) as unknown as Casino[];
}

export async function getCasinoCount(filters?: {
  search?: string;
  noDeposit?: boolean;
  freeSpins?: boolean;
  crypto?: boolean;
  countryCode?: string;
  regionCode?: string;
}): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = await createDataClient();
  const { ownerPreview, market } = await resolveRequestedMarket(filters);
  if (!ownerPreview && !market) return 0;
  if ((filters?.countryCode || filters?.regionCode) && !market) return 0;

  let query = market
    ? supabase.from("casino").select("id, market_compliance:casino_market_compliance!inner(market_code,status,listing_allowed)", { count: "exact", head: true })
        .eq("market_compliance.market_code", market)
        .eq("market_compliance.status", "approved")
        .eq("market_compliance.listing_allowed", true)
    : supabase.from("casino").select("id", { count: "exact", head: true });

  query = query.eq("active", true).eq("visible", true);
  if (filters?.noDeposit) query = query.eq("no_deposit", true);
  if (filters?.freeSpins) query = query.eq("free_spins", true);
  if (filters?.crypto) query = query.eq("crypto", true);
  if (filters?.search?.trim()) {
    const search = filters.search.trim();
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,welcome_bonus.ilike.%${search}%`);
  }
  const { count, error } = await query;
  if (error) { console.error("getCasinoCount:", error.message); return 0; }
  return count || 0;
}

export async function getCasinoBySlug(slug: string): Promise<Casino | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createDataClient();
  const ownerPreview = await isOwnerPreview();
  const market = ownerPreview ? null : await getVisitorMarket();
  if (!ownerPreview && !market) return null;

  let query = market
    ? supabase
        .from("casino")
        .select("*, market_compliance:casino_market_compliance!inner(market_code,status,listing_allowed,review_allowed,affiliate_cta_allowed,bonus_public_advertising_allowed,seo_index_allowed,evidence_confidence,last_checked_at)")
        .eq("market_compliance.market_code", market)
        .eq("market_compliance.status", "approved")
        .eq("market_compliance.review_allowed", true)
    : supabase.from("casino").select("*");

  const { data, error } = await query.eq("slug", slug).eq("active", true).eq("visible", true).maybeSingle();
  if (error) { console.error("getCasinoBySlug:", error.message); return null; }
  return data as unknown as Casino | null;
}

/* =========================================================
   BONUSES
========================================================= */

export async function getBonuses(filters?: {
  search?: string;
  type?: string;
  limit?: number;
}): Promise<Bonus[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createDataClient();
  const ownerPreview = await isOwnerPreview();
  const market = ownerPreview ? null : await getVisitorMarket();
  if (!ownerPreview && !market) return [];

  let query = market
    ? supabase.from("bonus")
        .select("*, casino:casino_id(id,name,slug,logo_url), market_compliance:bonus_market_compliance!inner(market_code,status,public_promotion_allowed,affiliate_cta_allowed)")
        .eq("market_compliance.market_code", market)
        .eq("market_compliance.status", "approved")
        .eq("market_compliance.public_promotion_allowed", true)
    : supabase.from("bonus").select("*, casino:casino_id(id,name,slug,logo_url)");

  query = query.eq("active", true).eq("status", "active").order("created_at", { ascending: false });
  if (filters?.type) query = query.ilike("type", `%${filters.type}%`);
  if (filters?.search?.trim()) {
    const search = filters.search.trim();
    query = query.or(`title.ilike.%${search}%,type.ilike.%${search}%,amount.ilike.%${search}%`);
  }
  if (filters?.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) { console.error("getBonuses:", error.message); return []; }
  return (data || []) as unknown as Bonus[];
}

export async function getBonusBySlug(slug: string): Promise<Bonus | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createDataClient();
  const ownerPreview = await isOwnerPreview();
  const market = ownerPreview ? null : await getVisitorMarket();
  if (!ownerPreview && !market) return null;
  let query = market
    ? supabase.from("bonus").select("*, casino:casino_id(id,name,slug,logo_url), market_compliance:bonus_market_compliance!inner(market_code,status,public_promotion_allowed)")
        .eq("market_compliance.market_code", market).eq("market_compliance.status", "approved").eq("market_compliance.public_promotion_allowed", true)
    : supabase.from("bonus").select("*, casino:casino_id(id,name,slug,logo_url)");
  const { data, error } = await query.eq("slug", slug).eq("active", true).eq("status", "active").maybeSingle();
  if (error) { console.error("getBonusBySlug:", error.message); return null; }
  return data as unknown as Bonus | null;
}

export async function getBonusesByCasino(casinoId: string): Promise<Bonus[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createDataClient();
  const ownerPreview = await isOwnerPreview();
  const market = ownerPreview ? null : await getVisitorMarket();
  if (!ownerPreview && !market) return [];
  let query = market
    ? supabase.from("bonus").select("*, casino:casino_id(id,name,slug,logo_url), market_compliance:bonus_market_compliance!inner(market_code,status,public_promotion_allowed,affiliate_cta_allowed)")
        .eq("market_compliance.market_code", market).eq("market_compliance.status", "approved").eq("market_compliance.public_promotion_allowed", true)
    : supabase.from("bonus").select("*, casino:casino_id(id,name,slug,logo_url)");
  const { data, error } = await query.eq("casino_id", casinoId).eq("active", true).eq("status", "active")
    .order("featured", { ascending: false }).order("sort_order", { ascending: true }).order("updated_at", { ascending: false });
  if (error) { console.error("getBonusesByCasino:", error.message); return []; }
  return (data || []) as unknown as Bonus[];
}

export async function getPromoCodesByCasino(casinoId: string): Promise<PromoCode[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createDataClient();
  const ownerPreview = await isOwnerPreview();
  const market = ownerPreview ? null : await getVisitorMarket();
  if (!ownerPreview && !market) return [];
  let query = market
    ? supabase.from("promo_code").select("*, market_compliance:promo_code_market_compliance!inner(market_code,status,public_promotion_allowed,affiliate_cta_allowed)")
        .eq("market_compliance.market_code", market).eq("market_compliance.status", "approved").eq("market_compliance.public_promotion_allowed", true)
    : supabase.from("promo_code").select("*");
  const { data, error } = await query.eq("casino_id", casinoId).eq("active", true).eq("status", "active")
    .order("featured", { ascending: false }).order("sort_order", { ascending: true }).order("updated_at", { ascending: false });
  if (error) { console.error("getPromoCodesByCasino:", error.message); return []; }
  return (data || []) as unknown as PromoCode[];
}

/* =========================================================
   GUIDES
========================================================= */

export async function getGuides(filters?: {
  search?: string;
  limit?: number;
}): Promise<Guide[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createDataClient();

  let query = supabase
    .from("guide")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (filters?.search) {
    const search = filters.search.trim();

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%`
      );
    }
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getGuides:", error.message);
    return [];
  }

  return (data || []) as Guide[];
}

export async function getGuideBySlug(
  slug: string
): Promise<Guide | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("guide")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getGuideBySlug:", error.message);
    return null;
  }

  return data as Guide | null;
}

/* =========================================================
   SPORTS
========================================================= */

export async function getSportCategories(): Promise<
  SportCategory[]
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("sport_category")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (error) {
    console.error("getSportCategories:", error.message);
    return [];
  }

  return (data || []) as SportCategory[];
}

export async function getSportMatches(filters?: {
  status?: string;
  categorySlug?: string;
  search?: string;
  limit?: number;
}): Promise<SportMatch[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createDataClient();

  let query = supabase
    .from("sport_match")
    .select(`
      *,
      home_team:home_team_id(name, slug, logo_url),
      away_team:away_team_id(name, slug, logo_url),
      league:league_id(
        name,
        slug,
        category:category_id(slug, name)
      )
    `)
    .order("start_time", { ascending: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getSportMatches:", error.message);
    return [];
  }

  let matches = (data || []) as SportMatch[];

  if (filters?.categorySlug) {
    matches = matches.filter(
      (m) =>
        m.league?.category?.slug === filters.categorySlug
    );
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();

    matches = matches.filter(
      (m) =>
        m.home_team?.name
          ?.toLowerCase()
          .includes(search) ||
        m.away_team?.name
          ?.toLowerCase()
          .includes(search) ||
        m.league?.name
          ?.toLowerCase()
          .includes(search)
    );
  }

  return matches;
}

export async function getSportMatchBySlug(
  slug: string
): Promise<SportMatch | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("sport_match")
    .select(`
      *,
      home_team:home_team_id(name, slug, logo_url),
      away_team:away_team_id(name, slug, logo_url),
      league:league_id(
        name,
        slug,
        category:category_id(slug, name)
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(
      "getSportMatchBySlug:",
      error.message
    );
    return null;
  }

  return data as SportMatch | null;
}

/* =========================================================
   GLOBAL SEARCH
========================================================= */

export async function globalSearch(
  q: string
): Promise<SearchResults> {
  const empty: SearchResults = {
    casinos: [],
    bonuses: [],
    guides: [],
    sports: [],
    teams: [],
    leagues: [],
  };

  if (!q.trim() || !isSupabaseConfigured()) {
    return empty;
  }

  const supabase = await createDataClient();
  const term = q.trim();

  const [
    casinos,
    bonuses,
    guides,
    sports,
    teams,
    leagues,
  ] = await Promise.all([
    supabase
      .from("casino")
      .select(
        "id, name, slug, rating, welcome_bonus"
      )
      .eq("active", true)
      .or(
        `name.ilike.%${term}%,description.ilike.%${term}%`
      )
      .limit(8),

    supabase
      .from("bonus")
      .select(
        "id, slug, title, type, amount"
      )
      .eq("active", true)
      .or(
        `title.ilike.%${term}%,type.ilike.%${term}%`
      )
      .limit(8),

    supabase
      .from("guide")
      .select(
        "id, slug, title, excerpt"
      )
      .eq("published", true)
      .or(
        `title.ilike.%${term}%,excerpt.ilike.%${term}%`
      )
      .limit(8),

    supabase
      .from("sport_match")
      .select(
        "id, slug, status, start_time"
      )
      .or(`slug.ilike.%${term}%`)
      .limit(8),

    supabase
      .from("sport_team")
      .select("id, name, slug")
      .ilike("name", `%${term}%`)
      .limit(8),

    supabase
      .from("sport_league")
      .select("id, name, slug")
      .ilike("name", `%${term}%`)
      .limit(8),
  ]);

  return {
    casinos:
      (casinos.data || []) as SearchResults["casinos"],

    bonuses:
      (bonuses.data || []) as SearchResults["bonuses"],

    guides:
      (guides.data || []) as SearchResults["guides"],

    sports:
      (sports.data || []) as SearchResults["sports"],

    teams:
      (teams.data || []) as SearchResults["teams"],

    leagues:
      (leagues.data || []) as SearchResults["leagues"],
  };
}

/* =========================================================
   SEO
========================================================= */

export async function getSeoSettings(
  pageKey: string
) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) {
    console.error(
      "getSeoSettings:",
      error.message
    );
    return null;
  }

  return data;
}

/* =========================================================
   ADMIN ANALYTICS
========================================================= */

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const empty: AdminAnalytics = {
    visitors: 0,
    casinoClicks: 0,
    affiliateClicks: 0,
    conversions: 0,
    revenue: 0,
    topCasinos: [],
    topBonuses: [],
    topPages: [],
    trafficSources: [],
  };

  if (!isSupabaseConfigured()) {
    return empty;
  }

  const supabase = await createDataClient();

  const since = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    views,
    clicks,
    ftds,
    revenue,
    casinoList,
  ] = await Promise.all([
    supabase
      .from("page_view")
      .select("path, referrer")
      .gte("created_at", since),

    supabase
      .from("affiliate_click")
      .select(
        "casino_id, bonus_id, source_page"
      )
      .gte("created_at", since),

    supabase
      .from("affiliate_ftd")
      .select("id")
      .gte("created_at", since),

    supabase
      .from("commission")
      .select("amount, status")
      .gte("created_at", since),

    supabase
      .from("casino")
      .select("id, name"),
  ]);

  const pageViews = views.data || [];
  const clickData = clicks.data || [];

  const casinoMap = new Map(
    (casinoList.data || []).map(
      (casino: {
        id: string;
        name: string;
      }) => [casino.id, casino.name]
    )
  );

  const pageCounts = new Map<
    string,
    number
  >();

  const sourceCounts = new Map<
    string,
    number
  >();

  const casinoClickCounts = new Map<
    string,
    number
  >();

  pageViews.forEach(
    (view: {
      path: string;
      referrer: string | null;
    }) => {
      pageCounts.set(
        view.path,
        (pageCounts.get(view.path) || 0) + 1
      );

      let source = "Direct";

      if (view.referrer) {
        try {
          source = new URL(
            view.referrer
          ).hostname;
        } catch {
          source = "Unknown";
        }
      }

      sourceCounts.set(
        source,
        (sourceCounts.get(source) || 0) + 1
      );
    }
  );

  clickData.forEach(
    (click: {
      casino_id: string | null;
    }) => {
      if (click.casino_id) {
        casinoClickCounts.set(
          click.casino_id,
          (casinoClickCounts.get(
            click.casino_id
          ) || 0) + 1
        );
      }
    }
  );

  const totalRevenue = (
    revenue.data || []
  )
    .filter(
      (record: {
        status: string;
      }) =>
        record.status === "approved" ||
        record.status === "paid"
    )
    .reduce(
      (
        sum: number,
        record: {
          amount: number;
        }
      ) =>
        sum + Number(record.amount),
      0
    );

  return {
    visitors: pageViews.length,

    casinoClicks: clickData.length,

    affiliateClicks: clickData.length,

    conversions:
      (ftds.data || []).length,

    revenue: totalRevenue,

    topCasinos: [
      ...casinoClickCounts.entries(),
    ]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5)
      .map(([id, count]) => ({
        name:
          casinoMap.get(id) ||
          "Unknown",
        clicks: count,
      })),

    topBonuses: [],

    topPages: [
      ...pageCounts.entries(),
    ]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5)
      .map(([path, views]) => ({
        path,
        views,
      })),

    trafficSources: [
      ...sourceCounts.entries(),
    ]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5)
      .map(([source, count]) => ({
        source,
        count,
      })),
  };
}

/* =========================================================
   CASINO HELPERS
========================================================= */

export async function getCasinosByIds(
  ids: string[]
): Promise<Casino[]> {
  if (
    !ids.length ||
    !isSupabaseConfigured()
  ) {
    return [];
  }

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("casino")
    .select("*")
    .in("id", ids)
    .eq("active", true);

  if (error) {
    console.error(
      "getCasinosByIds:",
      error.message
    );
    return [];
  }

  return (data || []) as Casino[];
}

/* =========================================================
   SEO MARKET HELPERS
========================================================= */

export async function getSeoEligibleMarkets(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createDataClient();
  const { data, error } = await supabase
    .from("casino_market_compliance")
    .select("market_code")
    .eq("status", "approved")
    .eq("listing_allowed", true)
    .eq("seo_index_allowed", true);
  if (error) {
    console.error("getSeoEligibleMarkets:", error.message);
    return [];
  }
  return [...new Set((data || []).map((row: { market_code: string }) => row.market_code))];
}

/* =========================================================
   STATIC PARAM HELPERS
========================================================= */

export async function getAllCasinoSlugs(): Promise<
  string[]
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("casino")
    .select("slug")
    .eq("active", true);

  if (error) {
    console.error(
      "getAllCasinoSlugs:",
      error.message
    );
    return [];
  }

  return (data || []).map(
    (casino: {
      slug: string;
    }) => casino.slug
  );
}

export async function getAllBonusSlugs(): Promise<
  string[]
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("bonus")
    .select("slug")
    .eq("active", true);

  if (error) {
    console.error(
      "getAllBonusSlugs:",
      error.message
    );
    return [];
  }

  return (data || []).map(
    (bonus: {
      slug: string;
    }) => bonus.slug
  );
}

export async function getAllGuideSlugs(): Promise<
  string[]
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createDataClient();

  const { data, error } = await supabase
    .from("guide")
    .select("slug")
    .eq("published", true);

  if (error) {
    console.error(
      "getAllGuideSlugs:",
      error.message
    );
    return [];
  }

  return (data || []).map(
    (guide: {
      slug: string;
    }) => guide.slug
  );
}
/* =========================================================
   NIVARO CORE — EVIDENCE & CHANGE HISTORY
========================================================= */
export async function getCasinoEvidence(casinoId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createDataClient();
  const { data, error } = await supabase
    .from("evidence_snapshot")
    .select("id,market_code,evidence_type,field_key,source_kind,source_url,source_title,status,confidence,checked_at,expires_at,extracted_value")
    .eq("casino_id", casinoId)
    .in("source_kind", ["regulator","official_site","official_terms","official_offer","affiliate"])
    .order("checked_at", { ascending: false })
    .limit(30);
  if (error) { console.error("getCasinoEvidence:", error.message); return []; }
  return data || [];
}

export async function getCasinoChangeHistory(casinoId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createDataClient();
  const { data, error } = await supabase
    .from("entity_change_history")
    .select("id,entity_type,field_name,old_value,new_value,source_url,source_type,detected_by,confidence,status,detected_at,applied_at")
    .eq("casino_id", casinoId)
    .order("detected_at", { ascending: false })
    .limit(30);
  if (error) { console.error("getCasinoChangeHistory:", error.message); return []; }
  return data || [];
}
