export type Casino = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url?: string | null;
  official_url?: string | null;
  description: string | null;
  review_content?: string | null;
  final_verdict?: string | null;
  rating: number;
  rating_breakdown?: Record<string, number> | null;
  welcome_bonus: string | null;
  no_deposit: boolean;
  free_spins: boolean;
  cashback: string | null;
  crypto: boolean;
  payment_methods: string[];
  providers: string[];
  games: string[];
  license_info: string | null;
  license_authority?: string | null;
  license_number?: string | null;
  owner_name?: string | null;
  founded_year?: number | null;
  country_codes: string[];
  region_codes?: string[];
  currencies?: string[];
  languages?: string[];
  us_states: string[];
  min_deposit: string | null;
  withdrawal_info: string | null;
  withdrawal_limits?: string | null;
  payout_speed?: string | null;
  kyc_required?: boolean | null;
  mobile_app?: boolean | null;
  live_chat?: boolean | null;
  vip_program?: boolean | null;
  support_email?: string | null;
  support_url?: string | null;
  pros: string[];
  cons: string[];
  affiliate_url: string | null;
  affiliate_partner_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  verified_at: string | null;
  verification_status?: string | null;
  visible?: boolean;
  featured?: boolean;
  last_checked_at?: string | null;
  last_successful_check_at?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Bonus = {
  id: string;
  casino_id: string | null;
  slug: string;
  type: string;
  title: string;
  amount: string | null;
  free_spins: string | null;
  wagering_requirement: string | null;
  promo_code: string | null;
  min_deposit: string | null;
  max_bonus: string | null;
  max_cashout: string | null;
  game_restrictions: string | null;
  terms_url: string | null;
  source_url: string | null;
  exclusive_offer: boolean;
  featured: boolean;
  eligible_countries: string[];
  eligible_states: string[];
  eligible_regions?: string[];
  terms: string | null;
  affiliate_tracking_url: string | null;
  expires_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  verified_at: string | null;
  source: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  casino?: Pick<Casino, "id" | "name" | "slug" | "logo_url"> | null;
};

export type Guide = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  categories: string[];
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AffiliatePartner = {
  id: string;
  name: string;
  slug: string;
  network: string | null;
  contact_email: string | null;
  api_base_url: string | null;
  api_key_secret_name: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SportCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
};

export type SportMatch = {
  id: string;
  league_id: string;
  external_id: string | null;
  slug: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  minute: string | null;
  start_time: string | null;
  venue: string | null;
  home_team?: { name: string; slug: string; logo_url: string | null } | null;
  away_team?: { name: string; slug: string; logo_url: string | null } | null;
  league?: { name: string; slug: string; category?: { slug: string; name: string } | null } | null;
};

export type SeoSettings = {
  id: string;
  page_key: string;
  title: string | null;
  description: string | null;
  canonical_path: string | null;
  og_image_url: string | null;
  no_index: boolean;
};

export type SearchResults = {
  casinos: Pick<Casino, "id" | "name" | "slug" | "rating" | "welcome_bonus">[];
  bonuses: Pick<Bonus, "id" | "slug" | "title" | "type" | "amount">[];
  guides: Pick<Guide, "id" | "slug" | "title" | "excerpt">[];
  sports: Pick<SportMatch, "id" | "slug" | "status" | "start_time">[];
  teams: { id: string; name: string; slug: string }[];
  leagues: { id: string; name: string; slug: string }[];
};

export type AdminAnalytics = {
  visitors: number;
  casinoClicks: number;
  affiliateClicks: number;
  conversions: number;
  revenue: number;
  topCasinos: { name: string; clicks: number }[];
  topBonuses: { title: string; clicks: number }[];
  topPages: { path: string; views: number }[];
  trafficSources: { source: string; count: number }[];
};

export type IntegrationConfig = {
  id: string;
  provider: string;
  integration_type: "casino" | "affiliate" | "sports";
  config: Record<string, unknown>;
  enabled: boolean;
  schedule_cron: string | null;
  last_synced_at: string | null;
};

export type SyncLog = {
  id: string;
  integration_id: string;
  status: string;
  records_processed: number;
  records_changed: number;
  errors: unknown[];
  started_at: string;
  finished_at: string | null;
};

export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type PromoCode = {
  id: string;
  casino_id: string;
  bonus_id: string | null;
  slug: string;
  code: string | null;
  title: string;
  description: string | null;
  promo_type: string | null;
  bonus_text: string | null;
  free_spins_count: number | null;
  no_deposit: boolean;
  min_deposit: string | null;
  wagering_requirement: string | null;
  max_cashout: string | null;
  eligible_countries: string[];
  eligible_regions?: string[];
  terms: string | null;
  terms_url: string | null;
  affiliate_tracking_url: string | null;
  source_url: string | null;
  expires_at: string | null;
  verified_at: string | null;
  last_checked_at: string | null;
  status: string;
  featured: boolean;
  exclusive_offer: boolean;
  active: boolean;
};
