-- Ecosystem: accounts, commercial relationships, offers, campaigns, tracking, billing, discovery.
-- Additive. Does not seed partners, prices, wallets, or fake metrics.

create table if not exists public.user_profile (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  display_name text,
  market_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preference (
  user_id uuid primary key references public.user_profile(id) on delete cascade,
  offers boolean not null default false,
  rewards boolean not null default false,
  learn boolean not null default false,
  games boolean not null default false,
  products boolean not null default false,
  events boolean not null default false,
  research boolean not null default false,
  followed boolean not null default false,
  digest text not null default 'weekly' check (digest in ('important','daily','weekly')),
  marketing_opt_in boolean not null default false,
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_saved_item (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profile(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create table if not exists public.user_follow (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profile(id) on delete cascade,
  platform_id uuid not null references public.platform(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, platform_id)
);

create table if not exists public.user_notification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profile(id) on delete cascade,
  kind text not null check (kind in ('transactional','marketing')),
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.company_commercial (
  platform_id uuid primary key references public.platform(id) on delete cascade,
  company_relationship text not null default 'unclaimed' check (company_relationship in ('unclaimed','claim_pending','verified','suspended','revoked')),
  affiliate_relationship text not null default 'none' check (affiliate_relationship in ('none','pending','active','paused','terminated')),
  advertising_relationship text not null default 'none' check (advertising_relationship in ('none','active','paused','suspended')),
  direct_tracking text not null default 'not_connected' check (direct_tracking in ('not_connected','configuring','testing','active','error','paused')),
  affiliate_permitted_for_campaigns boolean not null default false,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_account (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  status text not null default 'pending' check (status in ('pending','verified','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.partner_application (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  official_website text not null,
  representative_name text not null,
  business_email text not null,
  representative_role text not null,
  intent text not null,
  existing_platform_id uuid references public.platform(id),
  email_verified_at timestamptz,
  verification_score integer not null default 0,
  verification_status text not null default 'manual_review',
  verification_notes jsonb not null default '[]'::jsonb,
  status text not null default 'submitted' check (status in ('submitted','email_pending','in_review','approved','rejected','withdrawn')),
  created_at timestamptz not null default now()
);

create table if not exists public.company_claim (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  application_id uuid references public.partner_application(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.partner_membership (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  platform_id uuid not null references public.platform(id) on delete cascade,
  agency_id uuid references public.agency_account(id),
  role text not null check (role in ('owner','admin','affiliate_manager','marketing_manager','content_manager','analyst','billing_manager','agency_manager','viewer')),
  status text not null default 'active' check (status in ('invited','active','suspended')),
  created_at timestamptz not null default now(),
  unique (auth_user_id, platform_id)
);

create table if not exists public.offer (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  slug text unique,
  title text not null,
  offer_type text,
  reward_class text not null default 'unknown',
  reward_value text,
  currency text,
  eligibility text,
  new_users_only boolean,
  required_action text,
  minimum_deposit text,
  trading_requirement text,
  kyc_requirement text,
  eligible_markets text[] not null default '{}',
  excluded_markets text[] not null default '{}',
  start_at timestamptz,
  end_at timestamptz,
  terms_url text,
  official_source_url text,
  provenance text not null default 'partner_provided',
  verification_status text not null default 'needs_review',
  last_verified_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_record (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid references public.platform(id) on delete set null,
  slug text unique,
  title text not null,
  event_type text,
  starts_at timestamptz,
  ends_at timestamptz,
  official_url text,
  terms_url text,
  status text not null default 'draft',
  verification_status text not null default 'needs_review',
  created_at timestamptz not null default now()
);

create table if not exists public.external_game (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid references public.platform(id) on delete set null,
  slug text unique,
  name text not null,
  developer text,
  official_url text,
  genre text,
  networks text,
  reward_model text,
  status text not null default 'draft',
  verification_status text not null default 'needs_review',
  created_at timestamptz not null default now()
);

create table if not exists public.ad_product (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  pricing_model text not null check (pricing_model in ('fixed','daily','weekly','monthly','package','cpm','cpc','custom')),
  amount_minor bigint,
  currency text not null default 'USD',
  scale integer not null default 2,
  status text not null default 'draft' check (status in ('draft','active','paused')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_inventory (
  id uuid primary key default gen_random_uuid(),
  placement text not null,
  exclusive boolean not null default false,
  slot_limit integer not null default 1,
  status text not null default 'active',
  unique (placement)
);

create table if not exists public.campaign (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  offer_id uuid references public.offer(id) on delete set null,
  ad_product_id uuid references public.ad_product(id),
  name text not null,
  campaign_type text not null default 'general_advertising',
  status text not null default 'draft',
  placements text[] not null default '{}',
  geo_targets text[] not null default '{}',
  devices text[] not null default '{}',
  destination_kind text,
  destination_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  disclosed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracking_click (
  id uuid primary key default gen_random_uuid(),
  click_id text unique not null,
  platform_id uuid references public.platform(id) on delete set null,
  campaign_id uuid references public.campaign(id) on delete set null,
  offer_id uuid references public.offer(id) on delete set null,
  placement text,
  market_code text,
  device_category text,
  source_path text,
  destination_kind text,
  created_at timestamptz not null default now()
);

create table if not exists public.impression_event (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaign(id) on delete cascade,
  placement text,
  market_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversion_event (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  click_id text,
  event_id text not null,
  event_type text not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','reversed','test')),
  environment text not null default 'live' check (environment in ('live','test')),
  amount_minor bigint,
  currency text,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (platform_id, event_id)
);

create table if not exists public.commission_entry (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  conversion_id uuid references public.conversion_event(id),
  model text not null,
  status text not null default 'pending',
  amount_minor bigint not null default 0,
  currency text not null default 'USD',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  kind text not null check (kind in ('advertising','affiliate_statement')),
  status text not null default 'draft' check (status in ('draft','pending','paid','expired','failed','cancelled','refunded','partially_refunded')),
  amount_minor bigint not null default 0,
  currency text not null default 'USD',
  period_start date,
  period_end date,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_record (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoice(id) on delete set null,
  status text not null default 'pending',
  asset text,
  network text,
  public_address text,
  amount_minor bigint,
  provider_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.integration_endpoint (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  kind text not null check (kind in ('s2s_postback','rest_api','network_api','manual')),
  secret_hash text,
  status text not null default 'configuring',
  created_at timestamptz not null default now()
);

create table if not exists public.discovered_entity (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  official_url text,
  suggested_kind text,
  status text not null default 'discovered' check (status in ('discovered','qualified','verified','partner','rejected')),
  source_url text,
  source_name text,
  retrieved_at timestamptz,
  verification_status text not null default 'needs_review',
  created_at timestamptz not null default now()
);

create table if not exists public.partner_lead (
  id uuid primary key default gen_random_uuid(),
  discovered_id uuid references public.discovered_entity(id) on delete set null,
  platform_id uuid references public.platform(id) on delete set null,
  status text not null default 'discovered',
  created_at timestamptz not null default now()
);

create table if not exists public.outreach_contact (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.partner_lead(id) on delete cascade,
  channel text not null default 'official_email',
  value text not null,
  public_source_url text,
  status text not null default 'available',
  created_at timestamptz not null default now()
);

create table if not exists public.outreach_event (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.outreach_contact(id) on delete cascade,
  status text not null default 'prepared',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.suppression_entry (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  body text not null,
  category text not null default 'transactional',
  status text not null default 'queued' check (status in ('queued','sent','skipped','failed')),
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.user_profile enable row level security;
alter table public.notification_preference enable row level security;
alter table public.user_saved_item enable row level security;
alter table public.user_follow enable row level security;
alter table public.user_notification enable row level security;
alter table public.company_commercial enable row level security;
alter table public.agency_account enable row level security;
alter table public.partner_application enable row level security;
alter table public.company_claim enable row level security;
alter table public.partner_membership enable row level security;
alter table public.offer enable row level security;
alter table public.event_record enable row level security;
alter table public.external_game enable row level security;
alter table public.ad_product enable row level security;
alter table public.ad_inventory enable row level security;
alter table public.campaign enable row level security;
alter table public.tracking_click enable row level security;
alter table public.impression_event enable row level security;
alter table public.conversion_event enable row level security;
alter table public.commission_entry enable row level security;
alter table public.invoice enable row level security;
alter table public.payment_record enable row level security;
alter table public.integration_endpoint enable row level security;
alter table public.discovered_entity enable row level security;
alter table public.partner_lead enable row level security;
alter table public.outreach_contact enable row level security;
alter table public.outreach_event enable row level security;
alter table public.suppression_entry enable row level security;
alter table public.email_outbox enable row level security;
alter table public.audit_log enable row level security;

create index if not exists offer_platform_status_idx on public.offer (platform_id, status);
create index if not exists campaign_platform_status_idx on public.campaign (platform_id, status);
create index if not exists tracking_click_platform_idx on public.tracking_click (platform_id, created_at desc);
create index if not exists conversion_platform_idx on public.conversion_event (platform_id, created_at desc);
create index if not exists membership_user_idx on public.partner_membership (auth_user_id, status);
