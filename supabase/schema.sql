-- ============================================================
-- NIVARO — PRODUCTION DATABASE SCHEMA
-- Large-scale Casino Discovery / Affiliate CMS
-- Production-ready, scalable, monitoring-ready
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- UPDATED_AT HELPER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- ADMIN USERS
-- ============================================================

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin'
    check (role in ('admin', 'editor', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users
  add column if not exists updated_at timestamptz default now();


-- ============================================================
-- ADMIN CHECK HELPER
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and active = true
  );
$$;


-- ============================================================
-- AFFILIATE PARTNERS
-- ============================================================

create table if not exists public.affiliate_partner (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,

  network text,
  contact_email text,
  contact_name text,
  contact_telegram text,

  dashboard_url text,

  api_base_url text,
  api_key_secret_name text,

  preferred_model text
    check (
      preferred_model is null
      or preferred_model in ('revshare', 'cpa', 'hybrid', 'other')
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'active',
        'paused',
        'inactive',
        'rejected'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.affiliate_partner
  add column if not exists contact_name text;

alter table public.affiliate_partner
  add column if not exists contact_telegram text;

alter table public.affiliate_partner
  add column if not exists dashboard_url text;

alter table public.affiliate_partner
  add column if not exists preferred_model text;


-- ============================================================
-- CASINOS
-- ============================================================

create table if not exists public.casino (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text unique not null,

  official_url text,
  logo_url text,
  cover_image_url text,

  description text,
  review_content text,
  final_verdict text,

  rating numeric(3,1) not null default 0,
  rating_breakdown jsonb not null default '{}',

  welcome_bonus text,

  no_deposit boolean not null default false,
  no_deposit_bonus text,

  free_spins boolean not null default false,
  free_spins_count integer,
  free_spins_details text,

  cashback text,

  crypto boolean not null default false,

  payment_methods text[] not null default '{}',
  providers text[] not null default '{}',
  games text[] not null default '{}',

  license_info text,
  license_authority text,
  license_number text,

  owner_name text,
  founded_year integer,

  country_codes text[] not null default '{}',
  us_states text[] not null default '{}',

  currencies text[] not null default '{}',
  languages text[] not null default '{}',

  min_deposit text,

  withdrawal_info text,
  withdrawal_limits text,
  payout_speed text,

  kyc_required boolean,
  mobile_app boolean,
  live_chat boolean,
  vip_program boolean,

  support_email text,
  support_url text,

  pros text[] not null default '{}',
  cons text[] not null default '{}',

  affiliate_url text,

  affiliate_partner_id uuid
    references public.affiliate_partner(id)
    on delete set null,

  affiliate_partner_external_id text,

  seo_title text,
  seo_description text,

  verification_status text not null default 'pending'
    check (
      verification_status in (
        'pending',
        'verified',
        'unverified',
        'needs_review'
      )
    ),

  verified_at timestamptz,

  featured boolean not null default false,
  active boolean not null default true,
  visible boolean not null default true,

  sort_order integer not null default 0,

  -- AI Import
  ai_import_enabled boolean not null default true,

  ai_import_status text not null default 'not_started'
    check (
      ai_import_status in (
        'not_started',
        'queued',
        'running',
        'completed',
        'partial',
        'failed',
        'needs_review'
      )
    ),

  ai_import_confidence numeric(5,2),

  ai_imported_at timestamptz,

  ai_import_notes jsonb not null default '{}',

  -- Monitoring aggregate state
  monitoring_mode text not null default 'automatic'
    check (
      monitoring_mode in (
        'automatic',
        'manual',
        'paused'
      )
    ),

  monitoring_enabled boolean not null default true,

  auto_update_enabled boolean not null default true,

  monitoring_alerts_enabled boolean not null default true,

  monitoring_status text not null default 'pending'
    check (
      monitoring_status in (
        'pending',
        'healthy',
        'checking',
        'changed',
        'needs_review',
        'inaccessible',
        'paused',
        'manual',
        'error'
      )
    ),

  last_checked_at timestamptz,
  last_successful_check_at timestamptz,
  next_check_at timestamptz,

  last_monitoring_error text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- SAFE CASINO ALTERATIONS FOR EXISTING DATABASES
-- ============================================================

alter table public.casino
  add column if not exists official_url text;

alter table public.casino
  add column if not exists cover_image_url text;

alter table public.casino
  add column if not exists review_content text;

alter table public.casino
  add column if not exists final_verdict text;

alter table public.casino
  add column if not exists rating_breakdown jsonb default '{}';

alter table public.casino
  add column if not exists no_deposit_bonus text;

alter table public.casino
  add column if not exists free_spins_count integer;

alter table public.casino
  add column if not exists free_spins_details text;

alter table public.casino
  add column if not exists license_authority text;

alter table public.casino
  add column if not exists license_number text;

alter table public.casino
  add column if not exists owner_name text;

alter table public.casino
  add column if not exists founded_year integer;

alter table public.casino
  add column if not exists currencies text[] default '{}';

alter table public.casino
  add column if not exists languages text[] default '{}';

alter table public.casino
  add column if not exists withdrawal_limits text;

alter table public.casino
  add column if not exists payout_speed text;

alter table public.casino
  add column if not exists kyc_required boolean;

alter table public.casino
  add column if not exists mobile_app boolean;

alter table public.casino
  add column if not exists live_chat boolean;

alter table public.casino
  add column if not exists vip_program boolean;

alter table public.casino
  add column if not exists support_email text;

alter table public.casino
  add column if not exists support_url text;

alter table public.casino
  add column if not exists affiliate_partner_external_id text;

alter table public.casino
  add column if not exists verification_status text default 'pending';

alter table public.casino
  add column if not exists featured boolean default false;

alter table public.casino
  add column if not exists visible boolean default true;

alter table public.casino
  add column if not exists sort_order integer default 0;

alter table public.casino
  add column if not exists ai_import_enabled boolean default true;

alter table public.casino
  add column if not exists ai_import_status text default 'not_started';

alter table public.casino
  add column if not exists ai_import_confidence numeric(5,2);

alter table public.casino
  add column if not exists ai_imported_at timestamptz;

alter table public.casino
  add column if not exists ai_import_notes jsonb default '{}';

alter table public.casino
  add column if not exists monitoring_mode text default 'automatic';

alter table public.casino
  add column if not exists monitoring_enabled boolean default true;

alter table public.casino
  add column if not exists auto_update_enabled boolean default true;

alter table public.casino
  add column if not exists monitoring_alerts_enabled boolean default true;

alter table public.casino
  add column if not exists monitoring_status text default 'pending';

alter table public.casino
  add column if not exists last_checked_at timestamptz;

alter table public.casino
  add column if not exists last_successful_check_at timestamptz;

alter table public.casino
  add column if not exists next_check_at timestamptz;

alter table public.casino
  add column if not exists last_monitoring_error text;


-- ============================================================
-- CASINO MEDIA
-- ============================================================

create table if not exists public.casino_media (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid not null
    references public.casino(id)
    on delete cascade,

  media_type text not null
    check (
      media_type in (
        'logo',
        'cover',
        'screenshot',
        'banner',
        'promo',
        'other'
      )
    ),

  url text not null,

  alt_text text,

  sort_order integer not null default 0,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- BONUSES
-- ============================================================

create table if not exists public.bonus (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid not null
    references public.casino(id)
    on delete cascade,

  slug text unique not null,

  type text not null,

  title text not null,

  amount text,

  bonus_percentage numeric(7,2),

  free_spins text,
  free_spins_count integer,
  free_spins_value text,

  no_deposit boolean not null default false,

  deposit_required boolean,

  wagering_requirement text,

  promo_code text,

  min_deposit text,

  max_bonus text,

  max_cashout text,

  game_restrictions text,

  eligible_countries text[] not null default '{}',
  eligible_states text[] not null default '{}',

  new_players_only boolean,

  terms text,
  terms_url text,

  affiliate_tracking_url text,

  expires_at timestamptz,

  status text not null default 'active'
    check (
      status in (
        'active',
        'expired',
        'scheduled',
        'paused',
        'needs_review'
      )
    ),

  featured boolean not null default false,
  exclusive_offer boolean not null default false,

  seo_title text,
  seo_description text,

  verified_at timestamptz,

  source text,
  source_url text,

  last_checked_at timestamptz,

  sort_order integer not null default 0,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- BONUS ALTERATIONS
-- ============================================================

alter table public.bonus
  add column if not exists bonus_percentage numeric(7,2);

alter table public.bonus
  add column if not exists free_spins_count integer;

alter table public.bonus
  add column if not exists free_spins_value text;

alter table public.bonus
  add column if not exists no_deposit boolean default false;

alter table public.bonus
  add column if not exists deposit_required boolean;

alter table public.bonus
  add column if not exists max_cashout text;

alter table public.bonus
  add column if not exists game_restrictions text;

alter table public.bonus
  add column if not exists new_players_only boolean;

alter table public.bonus
  add column if not exists terms_url text;

alter table public.bonus
  add column if not exists status text default 'active';

alter table public.bonus
  add column if not exists featured boolean default false;

alter table public.bonus
  add column if not exists exclusive_offer boolean default false;

alter table public.bonus
  add column if not exists source_url text;

alter table public.bonus
  add column if not exists last_checked_at timestamptz;

alter table public.bonus
  add column if not exists sort_order integer default 0;


-- ============================================================
-- PROMO CODES
-- Dedicated unlimited promo-code system
-- ============================================================

create table if not exists public.promo_code (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid not null
    references public.casino(id)
    on delete cascade,

  bonus_id uuid
    references public.bonus(id)
    on delete set null,

  slug text unique not null,

  code text,

  title text not null,

  description text,

  promo_type text,

  bonus_text text,

  free_spins_count integer,

  no_deposit boolean not null default false,

  min_deposit text,

  wagering_requirement text,

  max_cashout text,

  game_restrictions text,

  eligible_countries text[] not null default '{}',

  new_players_only boolean,

  terms text,
  terms_url text,

  affiliate_tracking_url text,

  source_url text,

  expires_at timestamptz,

  verified_at timestamptz,

  last_checked_at timestamptz,

  status text not null default 'active'
    check (
      status in (
        'active',
        'expired',
        'scheduled',
        'paused',
        'needs_review'
      )
    ),

  featured boolean not null default false,
  exclusive_offer boolean not null default false,

  active boolean not null default true,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- CASINO MONITOR SOURCES
-- Multiple sources supported per casino
-- ============================================================

create table if not exists public.casino_monitor_source (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid not null
    references public.casino(id)
    on delete cascade,

  source_type text not null
    check (
      source_type in (
        'official',
        'bonuses',
        'promotions',
        'promo_codes',
        'news',
        'affiliate_feed',
        'api',
        'other'
      )
    ),

  source_url text,

  source_name text,

  enabled boolean not null default true,

  monitoring_mode text not null default 'automatic'
    check (
      monitoring_mode in (
        'automatic',
        'manual',
        'paused'
      )
    ),

  priority integer not null default 0,

  content_hash text,

  etag text,

  last_modified text,

  last_checked_at timestamptz,

  last_successful_at timestamptz,

  next_check_at timestamptz,

  consecutive_failures integer not null default 0,

  retry_count integer not null default 0,

  confirmed_inaccessible boolean not null default false,

  access_alert_sent boolean not null default false,

  paused_reason text,

  last_error text,

  metadata jsonb not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- GLOBAL AUTOMATION SETTINGS
-- ============================================================

create table if not exists public.automation_settings (
  id uuid primary key default gen_random_uuid(),

  singleton_key text unique not null default 'global',

  global_monitoring_enabled boolean not null default true,

  global_auto_update_enabled boolean not null default true,

  global_alerts_enabled boolean not null default true,

  ai_import_enabled boolean not null default true,

  check_interval_hours integer not null default 24
    check (check_interval_hours >= 1),

  transient_retry_limit integer not null default 3
    check (transient_retry_limit >= 0),

  pause_after_confirmed_access_failure boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- MONITORING RUNS
-- ============================================================

create table if not exists public.monitoring_run (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid
    references public.casino(id)
    on delete cascade,

  source_id uuid
    references public.casino_monitor_source(id)
    on delete cascade,

  status text not null
    check (
      status in (
        'started',
        'success',
        'no_change',
        'changed',
        'partial',
        'failed',
        'paused',
        'manual'
      )
    ),

  attempt_count integer not null default 1,

  records_checked integer not null default 0,

  changes_detected integer not null default 0,

  changes_applied integer not null default 0,

  ai_used boolean not null default false,

  error_code text,

  error_message text,

  metadata jsonb not null default '{}',

  started_at timestamptz not null default now(),

  finished_at timestamptz
);


-- ============================================================
-- NEEDS REVIEW / ADMIN ALERTS
-- ============================================================

create table if not exists public.monitoring_alert (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid
    references public.casino(id)
    on delete cascade,

  bonus_id uuid
    references public.bonus(id)
    on delete cascade,

  promo_code_id uuid
    references public.promo_code(id)
    on delete cascade,

  source_id uuid
    references public.casino_monitor_source(id)
    on delete cascade,

  alert_type text not null
    check (
      alert_type in (
        'possible_change',
        'access_failure',
        'source_inaccessible',
        'bonus_changed',
        'promo_changed',
        'promotion_changed',
        'expired_offer',
        'data_conflict',
        'ai_import_review',
        'monitoring_failed',
        'other'
      )
    ),

  severity text not null default 'info'
    check (
      severity in (
        'info',
        'warning',
        'critical'
      )
    ),

  title text not null,

  message text,

  dedupe_key text,

  details jsonb not null default '{}',

  status text not null default 'open'
    check (
      status in (
        'open',
        'resolved',
        'ignored'
      )
    ),

  first_seen_at timestamptz not null default now(),

  last_seen_at timestamptz not null default now(),

  notification_sent_at timestamptz,

  resolved_at timestamptz,

  resolved_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- One open alert per dedupe key
create unique index if not exists
idx_monitoring_alert_open_dedupe
on public.monitoring_alert(dedupe_key)
where dedupe_key is not null
and status = 'open';


-- ============================================================
-- CHANGE HISTORY / ROLLBACK FOUNDATION
-- ============================================================

create table if not exists public.entity_change_history (
  id uuid primary key default gen_random_uuid(),

  entity_type text not null
    check (
      entity_type in (
        'casino',
        'bonus',
        'promo_code',
        'monitor_source',
        'seo',
        'other'
      )
    ),

  entity_id uuid not null,

  casino_id uuid
    references public.casino(id)
    on delete cascade,

  field_name text,

  old_value jsonb,

  new_value jsonb,

  source_url text,

  source_type text,

  detected_by text not null default 'system'
    check (
      detected_by in (
        'system',
        'ai',
        'admin',
        'import'
      )
    ),

  confidence numeric(5,2),

  status text not null default 'detected'
    check (
      status in (
        'detected',
        'pending_review',
        'auto_applied',
        'approved',
        'rejected',
        'rolled_back'
      )
    ),

  detected_at timestamptz not null default now(),

  applied_at timestamptz,

  approved_by uuid
    references auth.users(id)
    on delete set null,

  rolled_back_at timestamptz,

  metadata jsonb not null default '{}',

  created_at timestamptz not null default now()
);


-- ============================================================
-- GUIDES / BLOG
-- ============================================================

create table if not exists public.guide (
  id uuid primary key default gen_random_uuid(),

  slug text unique not null,

  title text not null,

  excerpt text,

  content text not null default '',

  featured_image_url text,

  categories text[] not null default '{}',

  tags text[] not null default '{}',

  seo_title text,

  seo_description text,

  published boolean not null default false,

  published_at timestamptz,

  author_id uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- SEO SETTINGS
-- ============================================================

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),

  page_key text unique not null,

  title text,

  description text,

  canonical_path text,

  og_image_url text,

  no_index boolean not null default false,

  structured_data jsonb not null default '{}',

  updated_at timestamptz not null default now()
);


-- ============================================================
-- SEO LANDING PAGES
-- Country / payment / category / bonus SEO pages
-- ============================================================

create table if not exists public.seo_landing_page (
  id uuid primary key default gen_random_uuid(),

  page_type text not null
    check (
      page_type in (
        'country',
        'payment_method',
        'category',
        'bonus_type',
        'promo_codes',
        'custom'
      )
    ),

  slug text unique not null,

  title text not null,

  heading text,

  description text,

  content text not null default '',

  filters jsonb not null default '{}',

  seo_title text,

  seo_description text,

  canonical_path text,

  structured_data jsonb not null default '{}',

  published boolean not null default false,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- CONTENT PAGES
-- Editorial / disclosure / responsible gambling / methodology
-- ============================================================

create table if not exists public.content_page (
  id uuid primary key default gen_random_uuid(),

  slug text unique not null,

  title text not null,

  content text not null default '',

  page_type text,

  seo_title text,

  seo_description text,

  published boolean not null default false,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- AFFILIATE TRACKING
-- ============================================================

create table if not exists public.affiliate_click (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid
    references public.casino(id)
    on delete set null,

  bonus_id uuid
    references public.bonus(id)
    on delete set null,

  partner_id uuid
    references public.affiliate_partner(id)
    on delete set null,

  source_page text,

  visitor_id text,

  user_agent text,

  ip_hash text,

  created_at timestamptz not null default now()
);


create table if not exists public.affiliate_registration (
  id uuid primary key default gen_random_uuid(),

  partner_id uuid
    references public.affiliate_partner(id)
    on delete set null,

  casino_id uuid
    references public.casino(id)
    on delete set null,

  external_reference text,

  visitor_id text,

  status text default 'pending',

  registered_at timestamptz default now(),

  created_at timestamptz not null default now()
);


-- ============================================================
-- FINANCIAL TABLES
-- OWNER / ADMIN ONLY
-- AI MUST NEVER RECEIVE ACCESS TO THESE TABLES
-- ============================================================

create table if not exists public.affiliate_ftd (
  id uuid primary key default gen_random_uuid(),

  partner_id uuid
    references public.affiliate_partner(id)
    on delete set null,

  casino_id uuid
    references public.casino(id)
    on delete set null,

  registration_id uuid
    references public.affiliate_registration(id)
    on delete set null,

  amount numeric(12,2),

  currency text default 'USD',

  external_reference text,

  ftd_at timestamptz default now(),

  created_at timestamptz not null default now()
);


create table if not exists public.commission (
  id uuid primary key default gen_random_uuid(),

  partner_id uuid
    references public.affiliate_partner(id)
    on delete set null,

  casino_id uuid
    references public.casino(id)
    on delete set null,

  event_type text not null,

  amount numeric(12,2) not null default 0,

  currency text default 'USD',

  status text default 'pending'
    check (
      status in (
        'pending',
        'approved',
        'paid',
        'rejected'
      )
    ),

  external_reference text,

  period_start timestamptz,

  period_end timestamptz,

  paid_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


create table if not exists public.payout_history (
  id uuid primary key default gen_random_uuid(),

  partner_id uuid
    references public.affiliate_partner(id)
    on delete set null,

  amount numeric(12,2) not null,

  currency text default 'USD',

  status text default 'pending',

  reference text,

  paid_at timestamptz,

  created_at timestamptz not null default now()
);


create table if not exists public.revenue_event (
  id uuid primary key default gen_random_uuid(),

  partner_id uuid
    references public.affiliate_partner(id)
    on delete set null,

  casino_id uuid
    references public.casino(id)
    on delete set null,

  event_type text,

  amount numeric(12,2),

  currency text default 'USD',

  status text default 'pending',

  external_reference text,

  event_at timestamptz default now(),

  created_at timestamptz not null default now()
);


-- ============================================================
-- SPORTS
-- Kept structurally for future use.
-- Public feature remains hidden until real implementation.
-- ============================================================

create table if not exists public.sport_category (
  id uuid primary key default gen_random_uuid(),

  slug text unique not null,

  name text not null,

  icon text,

  sort_order integer default 0,

  active boolean default true
);


create table if not exists public.sport_league (
  id uuid primary key default gen_random_uuid(),

  category_id uuid
    references public.sport_category(id)
    on delete cascade,

  external_id text,

  slug text not null,

  name text not null,

  country text,

  logo_url text,

  active boolean default true,

  unique(category_id, slug)
);


create table if not exists public.sport_team (
  id uuid primary key default gen_random_uuid(),

  league_id uuid
    references public.sport_league(id)
    on delete cascade,

  external_id text,

  slug text not null,

  name text not null,

  logo_url text,

  unique(league_id, slug)
);


create table if not exists public.sport_match (
  id uuid primary key default gen_random_uuid(),

  league_id uuid
    references public.sport_league(id)
    on delete cascade,

  external_id text unique,

  slug text not null,

  home_team_id uuid
    references public.sport_team(id)
    on delete set null,

  away_team_id uuid
    references public.sport_team(id)
    on delete set null,

  home_score integer,

  away_score integer,

  status text default 'scheduled'
    check (
      status in (
        'scheduled',
        'live',
        'finished',
        'postponed',
        'cancelled'
      )
    ),

  minute text,

  start_time timestamptz,

  venue text,

  metadata jsonb not null default '{}',

  updated_at timestamptz not null default now()
);


create table if not exists public.sport_favorite (
  id uuid primary key default gen_random_uuid(),

  visitor_id text not null,

  entity_type text not null
    check (
      entity_type in (
        'team',
        'league',
        'match'
      )
    ),

  entity_id uuid not null,

  created_at timestamptz not null default now(),

  unique(visitor_id, entity_type, entity_id)
);


-- ============================================================
-- INTEGRATIONS & SYNC
-- ============================================================

create table if not exists public.integration_config (
  id uuid primary key default gen_random_uuid(),

  provider text not null,

  integration_type text not null
    check (
      integration_type in (
        'casino',
        'affiliate',
        'sports',
        'ai_monitoring'
      )
    ),

  config jsonb not null default '{}',

  enabled boolean not null default false,

  schedule_cron text,

  last_synced_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique(provider, integration_type)
);


create table if not exists public.sync_log (
  id uuid primary key default gen_random_uuid(),

  integration_id uuid
    references public.integration_config(id)
    on delete cascade,

  status text not null
    check (
      status in (
        'started',
        'success',
        'partial',
        'failed'
      )
    ),

  records_processed integer not null default 0,

  records_changed integer not null default 0,

  errors jsonb not null default '[]',

  started_at timestamptz not null default now(),

  finished_at timestamptz
);


-- ============================================================
-- ANALYTICS
-- ============================================================

create table if not exists public.page_view (
  id uuid primary key default gen_random_uuid(),

  path text not null,

  referrer text,

  visitor_id text,

  user_agent text,

  created_at timestamptz not null default now()
);


-- ============================================================
-- AUDIT LOG
-- ============================================================

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),

  actor_user_id uuid
    references auth.users(id)
    on delete set null,

  action text not null,

  entity_type text,

  entity_id uuid,

  metadata jsonb not null default '{}',

  created_at timestamptz not null default now()
);


-- ============================================================
-- PLATFORM SETTINGS
-- ============================================================

create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),

  key text unique not null,

  value jsonb not null default '{}',

  updated_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_casino_slug
  on public.casino(slug);

create index if not exists idx_casino_active
  on public.casino(active);

create index if not exists idx_casino_visible
  on public.casino(visible);

create index if not exists idx_casino_featured
  on public.casino(featured);

create index if not exists idx_casino_rating
  on public.casino(rating desc);

create index if not exists idx_casino_monitoring_mode
  on public.casino(monitoring_mode);

create index if not exists idx_casino_monitoring_status
  on public.casino(monitoring_status);

create index if not exists idx_casino_next_check
  on public.casino(next_check_at);

create index if not exists idx_bonus_slug
  on public.bonus(slug);

create index if not exists idx_bonus_active
  on public.bonus(active);

create index if not exists idx_bonus_casino
  on public.bonus(casino_id);

create index if not exists idx_bonus_status
  on public.bonus(status);

create index if not exists idx_bonus_expires
  on public.bonus(expires_at);

create index if not exists idx_promo_slug
  on public.promo_code(slug);

create index if not exists idx_promo_casino
  on public.promo_code(casino_id);

create index if not exists idx_promo_status
  on public.promo_code(status);

create index if not exists idx_promo_expires
  on public.promo_code(expires_at);

create index if not exists idx_media_casino
  on public.casino_media(casino_id);

create index if not exists idx_monitor_source_casino
  on public.casino_monitor_source(casino_id);

create index if not exists idx_monitor_source_next_check
  on public.casino_monitor_source(next_check_at);

create index if not exists idx_monitor_source_enabled
  on public.casino_monitor_source(enabled);

create index if not exists idx_monitor_run_casino
  on public.monitoring_run(casino_id);

create index if not exists idx_monitor_run_started
  on public.monitoring_run(started_at desc);

create index if not exists idx_monitor_alert_casino
  on public.monitoring_alert(casino_id);

create index if not exists idx_monitor_alert_status
  on public.monitoring_alert(status);

create index if not exists idx_change_history_entity
  on public.entity_change_history(entity_type, entity_id);

create index if not exists idx_change_history_casino
  on public.entity_change_history(casino_id);

create index if not exists idx_change_history_created
  on public.entity_change_history(created_at desc);

create index if not exists idx_guide_slug
  on public.guide(slug);

create index if not exists idx_guide_published
  on public.guide(published);

create index if not exists idx_seo_landing_slug
  on public.seo_landing_page(slug);

create index if not exists idx_seo_landing_published
  on public.seo_landing_page(published);

create index if not exists idx_content_page_slug
  on public.content_page(slug);

create index if not exists idx_affiliate_click_created
  on public.affiliate_click(created_at);

create index if not exists idx_page_view_created
  on public.page_view(created_at);

create index if not exists idx_sport_match_status
  on public.sport_match(status);

create index if not exists idx_sport_match_start
  on public.sport_match(start_time);


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists admin_users_updated_at
on public.admin_users;

create trigger admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();


drop trigger if exists affiliate_partner_updated_at
on public.affiliate_partner;

create trigger affiliate_partner_updated_at
before update on public.affiliate_partner
for each row
execute function public.set_updated_at();


drop trigger if exists casino_updated_at
on public.casino;

create trigger casino_updated_at
before update on public.casino
for each row
execute function public.set_updated_at();


drop trigger if exists casino_media_updated_at
on public.casino_media;

create trigger casino_media_updated_at
before update on public.casino_media
for each row
execute function public.set_updated_at();


drop trigger if exists bonus_updated_at
on public.bonus;

create trigger bonus_updated_at
before update on public.bonus
for each row
execute function public.set_updated_at();


drop trigger if exists promo_code_updated_at
on public.promo_code;

create trigger promo_code_updated_at
before update on public.promo_code
for each row
execute function public.set_updated_at();


drop trigger if exists casino_monitor_source_updated_at
on public.casino_monitor_source;

create trigger casino_monitor_source_updated_at
before update on public.casino_monitor_source
for each row
execute function public.set_updated_at();


drop trigger if exists automation_settings_updated_at
on public.automation_settings;

create trigger automation_settings_updated_at
before update on public.automation_settings
for each row
execute function public.set_updated_at();


drop trigger if exists monitoring_alert_updated_at
on public.monitoring_alert;

create trigger monitoring_alert_updated_at
before update on public.monitoring_alert
for each row
execute function public.set_updated_at();


drop trigger if exists guide_updated_at
on public.guide;

create trigger guide_updated_at
before update on public.guide
for each row
execute function public.set_updated_at();


drop trigger if exists seo_landing_page_updated_at
on public.seo_landing_page;

create trigger seo_landing_page_updated_at
before update on public.seo_landing_page
for each row
execute function public.set_updated_at();


drop trigger if exists content_page_updated_at
on public.content_page;

create trigger content_page_updated_at
before update on public.content_page
for each row
execute function public.set_updated_at();


drop trigger if exists commission_updated_at
on public.commission;

create trigger commission_updated_at
before update on public.commission
for each row
execute function public.set_updated_at();


drop trigger if exists integration_config_updated_at
on public.integration_config;

create trigger integration_config_updated_at
before update on public.integration_config
for each row
execute function public.set_updated_at();


-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table public.admin_users enable row level security;

alter table public.affiliate_partner enable row level security;

alter table public.casino enable row level security;

alter table public.casino_media enable row level security;

alter table public.bonus enable row level security;

alter table public.promo_code enable row level security;

alter table public.casino_monitor_source enable row level security;

alter table public.automation_settings enable row level security;

alter table public.monitoring_run enable row level security;

alter table public.monitoring_alert enable row level security;

alter table public.entity_change_history enable row level security;

alter table public.guide enable row level security;

alter table public.seo_settings enable row level security;

alter table public.seo_landing_page enable row level security;

alter table public.content_page enable row level security;

alter table public.affiliate_click enable row level security;

alter table public.affiliate_registration enable row level security;

alter table public.affiliate_ftd enable row level security;

alter table public.commission enable row level security;

alter table public.payout_history enable row level security;

alter table public.revenue_event enable row level security;

alter table public.sport_category enable row level security;

alter table public.sport_league enable row level security;

alter table public.sport_team enable row level security;

alter table public.sport_match enable row level security;

alter table public.sport_favorite enable row level security;

alter table public.integration_config enable row level security;

alter table public.sync_log enable row level security;

alter table public.page_view enable row level security;

alter table public.audit_log enable row level security;

alter table public.platform_settings enable row level security;


-- ============================================================
-- DROP OLD / RECREATED POLICIES
-- Makes schema rerunnable safely
-- ============================================================

drop policy if exists "public read active casinos"
on public.casino;

drop policy if exists "public read active bonuses"
on public.bonus;

drop policy if exists "public read active promo codes"
on public.promo_code;

drop policy if exists "public read active casino media"
on public.casino_media;

drop policy if exists "public read published guides"
on public.guide;

drop policy if exists "public read seo settings"
on public.seo_settings;

drop policy if exists "public read seo landing pages"
on public.seo_landing_page;

drop policy if exists "public read content pages"
on public.content_page;

drop policy if exists "public read sport categories"
on public.sport_category;

drop policy if exists "public read sport leagues"
on public.sport_league;

drop policy if exists "public read sport teams"
on public.sport_team;

drop policy if exists "public read sport matches"
on public.sport_match;


drop policy if exists "admin all casinos"
on public.casino;

drop policy if exists "admin all casino media"
on public.casino_media;

drop policy if exists "admin all bonuses"
on public.bonus;

drop policy if exists "admin all promo codes"
on public.promo_code;

drop policy if exists "admin all guides"
on public.guide;

drop policy if exists "admin all seo"
on public.seo_settings;

drop policy if exists "admin all seo landing pages"
on public.seo_landing_page;

drop policy if exists "admin all content pages"
on public.content_page;

drop policy if exists "admin all partners"
on public.affiliate_partner;

drop policy if exists "admin all monitor sources"
on public.casino_monitor_source;

drop policy if exists "admin all automation settings"
on public.automation_settings;

drop policy if exists "admin all monitoring runs"
on public.monitoring_run;

drop policy if exists "admin all monitoring alerts"
on public.monitoring_alert;

drop policy if exists "admin all change history"
on public.entity_change_history;

drop policy if exists "admin read clicks"
on public.affiliate_click;

drop policy if exists "admin all registrations"
on public.affiliate_registration;

drop policy if exists "admin all ftd"
on public.affiliate_ftd;

drop policy if exists "admin all commissions"
on public.commission;

drop policy if exists "admin all payouts"
on public.payout_history;

drop policy if exists "admin all revenue"
on public.revenue_event;

drop policy if exists "admin all sports"
on public.sport_category;

drop policy if exists "admin all leagues"
on public.sport_league;

drop policy if exists "admin all teams"
on public.sport_team;

drop policy if exists "admin all matches"
on public.sport_match;

drop policy if exists "admin all integrations"
on public.integration_config;

drop policy if exists "admin all sync logs"
on public.sync_log;

drop policy if exists "admin read page views"
on public.page_view;

drop policy if exists "admin read audit"
on public.audit_log;

drop policy if exists "admin all settings"
on public.platform_settings;

drop policy if exists "admin read admin_users"
on public.admin_users;


-- ============================================================
-- PUBLIC READ POLICIES
-- ============================================================

create policy "public read active casinos"
on public.casino
for select
using (
  active = true
  and visible = true
);


create policy "public read active bonuses"
on public.bonus
for select
using (
  active = true
  and status = 'active'
);


create policy "public read active promo codes"
on public.promo_code
for select
using (
  active = true
  and status = 'active'
);


create policy "public read active casino media"
on public.casino_media
for select
using (
  active = true
);


create policy "public read published guides"
on public.guide
for select
using (
  published = true
);


create policy "public read seo settings"
on public.seo_settings
for select
using (true);


create policy "public read seo landing pages"
on public.seo_landing_page
for select
using (
  published = true
);


create policy "public read content pages"
on public.content_page
for select
using (
  published = true
);


create policy "public read sport categories"
on public.sport_category
for select
using (
  active = true
);


create policy "public read sport leagues"
on public.sport_league
for select
using (
  active = true
);


create policy "public read sport teams"
on public.sport_team
for select
using (true);


create policy "public read sport matches"
on public.sport_match
for select
using (true);


-- ============================================================
-- ADMIN FULL ACCESS POLICIES
-- ============================================================

create policy "admin all casinos"
on public.casino
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all casino media"
on public.casino_media
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all bonuses"
on public.bonus
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all promo codes"
on public.promo_code
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all guides"
on public.guide
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all seo"
on public.seo_settings
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all seo landing pages"
on public.seo_landing_page
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all content pages"
on public.content_page
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all partners"
on public.affiliate_partner
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all monitor sources"
on public.casino_monitor_source
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all automation settings"
on public.automation_settings
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all monitoring runs"
on public.monitoring_run
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all monitoring alerts"
on public.monitoring_alert
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all change history"
on public.entity_change_history
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin read clicks"
on public.affiliate_click
for select
using (public.is_admin());


create policy "admin all registrations"
on public.affiliate_registration
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all ftd"
on public.affiliate_ftd
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all commissions"
on public.commission
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all payouts"
on public.payout_history
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all revenue"
on public.revenue_event
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all sports"
on public.sport_category
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all leagues"
on public.sport_league
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all teams"
on public.sport_team
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all matches"
on public.sport_match
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all integrations"
on public.integration_config
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin all sync logs"
on public.sync_log
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin read page views"
on public.page_view
for select
using (public.is_admin());


create policy "admin read audit"
on public.audit_log
for select
using (public.is_admin());


create policy "admin all settings"
on public.platform_settings
for all
using (public.is_admin())
with check (public.is_admin());


create policy "admin read admin_users"
on public.admin_users
for select
using (public.is_admin());


-- ============================================================
-- DEFAULT AUTOMATION SETTINGS
-- ============================================================

insert into public.automation_settings (
  singleton_key,
  global_monitoring_enabled,
  global_auto_update_enabled,
  global_alerts_enabled,
  ai_import_enabled,
  check_interval_hours,
  transient_retry_limit,
  pause_after_confirmed_access_failure
)
values (
  'global',
  true,
  true,
  true,
  true,
  24,
  3,
  true
)
on conflict (singleton_key)
do nothing;


-- ============================================================
-- DEFAULT PLATFORM SETTINGS
-- ============================================================

insert into public.platform_settings (
  key,
  value
)
values
(
  'site_features',
  '{
    "sports_enabled": false,
    "casino_monitoring_enabled": true,
    "ai_import_enabled": true,
    "promo_codes_enabled": true,
    "no_deposit_enabled": true,
    "free_spins_enabled": true,
    "compare_enabled": true
  }'::jsonb
)
on conflict (key)
do nothing;


-- ============================================================
-- DEFAULT SEO
-- Sports intentionally hidden / no-index
-- ============================================================

insert into public.seo_settings (
  page_key,
  title,
  description,
  canonical_path,
  no_index
)
values

(
  'home',
  'Nivaro — Casinos, Bonuses & Promo Codes',
  'Discover verified online casinos, current bonuses, promo codes, free spins and detailed casino reviews on Nivaro.',
  '/',
  false
),

(
  'casinos',
  'Best Online Casinos — Nivaro',
  'Compare online casinos with verified information, current bonuses, payment methods, games and detailed reviews.',
  '/casinos',
  false
),

(
  'bonuses',
  'Casino Bonuses — Nivaro',
  'Explore current casino bonuses, welcome offers, no deposit bonuses, free spins and promotional offers.',
  '/bonuses',
  false
),

(
  'promo-codes',
  'Casino Promo Codes — Nivaro',
  'Find current casino promo codes, bonus codes and promotional offers with clear terms and verification information.',
  '/promo-codes',
  false
),

(
  'no-deposit',
  'No Deposit Casino Bonuses — Nivaro',
  'Discover current no deposit casino bonuses with verified terms, availability and promotional information.',
  '/bonuses/no-deposit',
  false
),

(
  'free-spins',
  'Free Spins Casino Bonuses — Nivaro',
  'Compare current free spins offers from online casinos with clear bonus terms and availability.',
  '/bonuses/free-spins',
  false
),

(
  'guides',
  'Casino Guides — Nivaro',
  'Explore detailed casino guides, payment information, bonus explanations and responsible gambling resources.',
  '/guides',
  false
),

(
  'sports',
  'Sports — Nivaro',
  'Sports features are currently unavailable.',
  '/sports',
  true
)

on conflict (page_key)
do update set

  title = excluded.title,

  description = excluded.description,

  canonical_path = excluded.canonical_path,

  no_index = excluded.no_index,

  updated_at = now();


-- ============================================================
-- RESPONSIBLE / EDITORIAL CONTENT PLACEHOLDERS
-- Real content will be managed from Admin.
-- ============================================================

insert into public.content_page (
  slug,
  title,
  page_type,
  published
)
values

(
  'affiliate-disclosure',
  'Affiliate Disclosure',
  'legal',
  false
),

(
  'responsible-gambling',
  'Responsible Gambling',
  'responsible_gambling',
  false
),

(
  'how-we-rate',
  'How We Rate Casinos',
  'editorial',
  false
),

(
  'editorial-policy',
  'Editorial Policy',
  'editorial',
  false
)

on conflict (slug)
do nothing;


-- ============================================================
-- SPORTS SEED
-- Kept only for future architecture.
-- Public sports remains disabled.
-- ============================================================

insert into public.sport_category (
  slug,
  name,
  sort_order
)
values

('football', 'Football', 1),
('basketball', 'Basketball', 2),
('tennis', 'Tennis', 3),
('mma', 'MMA', 4),
('boxing', 'Boxing', 5),
('hockey', 'Hockey', 6),
('baseball', 'Baseball', 7),
('formula-1', 'Formula 1', 8),
('cricket', 'Cricket', 9),
('rugby', 'Rugby', 10)

on conflict (slug)
do nothing;


-- ============================================================
-- IMPORTANT SECURITY NOTE
--
-- AI / monitoring code must NEVER receive direct access to:
--
-- public.affiliate_ftd
-- public.commission
-- public.payout_history
-- public.revenue_event
--
-- AI operates only on:
--
-- casino
-- casino_media
-- bonus
-- promo_code
-- casino_monitor_source
-- monitoring_run
-- monitoring_alert
-- entity_change_history
--
-- Financial information remains ADMIN / OWNER ONLY.
-- ============================================================
-- ============================================================
-- 2026 scalable GEO/Search Console additions
-- ============================================================
alter table public.casino add column if not exists region_codes text[] not null default '{}';
alter table public.bonus add column if not exists eligible_regions text[] not null default '{}';
alter table public.promo_code add column if not exists eligible_regions text[] not null default '{}';
create index if not exists casino_country_codes_gin_idx on public.casino using gin(country_codes);
create index if not exists casino_region_codes_gin_idx on public.casino using gin(region_codes);
create table if not exists public.search_console_metric (
  id uuid primary key default gen_random_uuid(), property text not null, data_date date not null,
  query text not null default '', page text not null default '', country text not null default '', device text not null default '',
  clicks numeric not null default 0, impressions numeric not null default 0, ctr numeric not null default 0, position numeric not null default 0,
  created_at timestamptz not null default now(), unique(property, data_date, query, page, country, device)
);
alter table public.search_console_metric enable row level security;

-- NivaroBet scale indexes (safe to re-run)
create index if not exists casino_public_directory_idx on public.casino(active, visible, featured, sort_order, rating desc);
create index if not exists casino_monitor_due_idx on public.casino(monitoring_enabled, next_check_at) where monitoring_enabled = true;
create index if not exists casino_monitor_status_idx on public.casino(monitoring_status);
create index if not exists bonus_casino_active_idx on public.bonus(casino_id, active, status, sort_order);
create index if not exists bonus_updated_idx on public.bonus(updated_at desc);
create index if not exists promo_code_casino_active_idx on public.promo_code(casino_id, active, status, sort_order);
create index if not exists promo_code_updated_idx on public.promo_code(updated_at desc);
create index if not exists monitoring_source_due_idx on public.casino_monitor_source(enabled, next_check_at) where enabled = true;

-- ============================================================
-- NIVAROBET MARKET COMPLIANCE LAYER (2026-08)
-- Safe default: nothing is approved automatically.
-- ============================================================
create table if not exists public.casino_market_compliance (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid not null references public.casino(id) on delete cascade,
  market_code text not null check (market_code in ('gb','dk','ontario')),
  status text not null default 'pending' check (status in ('pending','approved','blocked','needs_legal_review')),
  operator_licensed boolean not null default false,
  affiliate_marketing_approved boolean not null default false,
  bonus_public_advertising_allowed boolean not null default false,
  regulator_name text,
  regulator_source_url text,
  partner_terms_url text,
  evidence_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(casino_id, market_code)
);
create index if not exists casino_market_compliance_market_status_idx on public.casino_market_compliance(market_code,status);

-- Existing country/region tags are treated as legacy candidate data, not legal approval.
comment on column public.casino.country_codes is 'Legacy candidate GEO tags only. Public visibility is controlled exclusively by casino_market_compliance and is fail-closed.';

-- Legacy GEO tags are preserved for historical/admin reference only.
-- Public eligibility no longer trusts these arrays; casino_market_compliance is the fail-closed source of truth.
create table if not exists public.casino_geo_legacy_backup as
select id as casino_id, country_codes, region_codes, now() as backed_up_at
from public.casino
where cardinality(country_codes) > 0 or cardinality(region_codes) > 0;

-- ============================================================
-- NIVARO CORE — SMART MARKET / EVIDENCE / OFFER LAYER
-- ============================================================

alter table public.casino_market_compliance
  add column if not exists listing_allowed boolean not null default false;
alter table public.casino_market_compliance
  add column if not exists review_allowed boolean not null default false;
alter table public.casino_market_compliance
  add column if not exists affiliate_cta_allowed boolean not null default false;
alter table public.casino_market_compliance
  add column if not exists seo_index_allowed boolean not null default false;
alter table public.casino_market_compliance
  add column if not exists exact_domain_match boolean not null default false;
alter table public.casino_market_compliance
  add column if not exists exact_operator_match boolean not null default false;
alter table public.casino_market_compliance
  add column if not exists registry_status text;
alter table public.casino_market_compliance
  add column if not exists evidence_confidence numeric(5,2) not null default 0;
alter table public.casino_market_compliance
  add column if not exists last_checked_at timestamptz;
alter table public.casino_market_compliance
  add column if not exists next_check_at timestamptz;
alter table public.casino_market_compliance
  add column if not exists last_error text;

create table if not exists public.market_registry_entry (
  id uuid primary key default gen_random_uuid(),
  market_code text not null check (market_code in ('gb','dk','ontario')),
  operator_name text,
  trading_name text,
  domain text not null,
  licence_number text,
  regulator_name text not null,
  regulator_source_url text not null,
  source_record_url text,
  active boolean not null default true,
  source_hash text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  unique(market_code, domain)
);
create index if not exists market_registry_entry_lookup_idx
  on public.market_registry_entry(market_code, domain, active);

create table if not exists public.market_registry_sync (
  id uuid primary key default gen_random_uuid(),
  market_code text not null check (market_code in ('gb','dk','ontario')),
  regulator_name text not null,
  source_url text not null,
  status text not null default 'pending' check (status in ('pending','running','success','partial','failed')),
  entries_seen integer not null default 0,
  entries_changed integer not null default 0,
  source_hash text,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.evidence_snapshot (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid references public.casino(id) on delete cascade,
  bonus_id uuid references public.bonus(id) on delete cascade,
  market_code text,
  evidence_type text not null,
  field_key text,
  source_kind text not null check (source_kind in ('regulator','affiliate','official_site','official_terms','official_offer','other')),
  source_url text not null,
  source_title text,
  extracted_value jsonb,
  content_hash text,
  status text not null default 'current' check (status in ('current','stale','conflict','unreachable','superseded')),
  confidence numeric(5,2) not null default 0,
  checked_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'
);
create index if not exists evidence_snapshot_casino_idx on public.evidence_snapshot(casino_id, checked_at desc);
create index if not exists evidence_snapshot_bonus_idx on public.evidence_snapshot(bonus_id, checked_at desc);
create index if not exists evidence_snapshot_market_idx on public.evidence_snapshot(market_code, evidence_type, checked_at desc);

create table if not exists public.bonus_market_compliance (
  id uuid primary key default gen_random_uuid(),
  bonus_id uuid not null references public.bonus(id) on delete cascade,
  market_code text not null check (market_code in ('gb','dk','ontario')),
  status text not null default 'pending' check (status in ('pending','approved','blocked','needs_legal_review')),
  public_promotion_allowed boolean not null default false,
  affiliate_cta_allowed boolean not null default false,
  evidence_notes text,
  regulator_source_url text,
  partner_terms_url text,
  last_checked_at timestamptz,
  next_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bonus_id, market_code)
);
create index if not exists bonus_market_compliance_lookup_idx
  on public.bonus_market_compliance(market_code, status, public_promotion_allowed);

create table if not exists public.smart_import_run (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid references public.casino(id) on delete set null,
  affiliate_url text not null,
  resolved_url text,
  status text not null default 'running' check (status in ('running','completed','partial','needs_review','failed')),
  facts_found integer not null default 0,
  facts_verified integer not null default 0,
  offers_found integer not null default 0,
  markets_approved integer not null default 0,
  warnings jsonb not null default '[]',
  sources jsonb not null default '[]',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Public asset cache for brand logos discovered from official sources.
insert into storage.buckets (id, name, public)
values ('casino-assets', 'casino-assets', true)
on conflict (id) do update set public = excluded.public;

-- Nivaro Core uses service-role writes; public reads are limited to public bucket URLs.

create table if not exists public.promo_code_market_compliance (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references public.promo_code(id) on delete cascade,
  market_code text not null check (market_code in ('gb','dk','ontario')),
  status text not null default 'pending' check (status in ('pending','approved','blocked','needs_legal_review')),
  public_promotion_allowed boolean not null default false,
  affiliate_cta_allowed boolean not null default false,
  evidence_notes text,
  last_checked_at timestamptz,
  next_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(promo_code_id, market_code)
);
create index if not exists promo_code_market_compliance_lookup_idx
  on public.promo_code_market_compliance(market_code,status,public_promotion_allowed);


-- 2026-08 safety migration note:
-- casino.verification_status / casino.verified_at are retained only for backward compatibility
-- with older imports. They are not used for public eligibility, admin market decisions, SEO
-- indexing, or affiliate CTA permission. casino_market_compliance is the sole source of truth.
