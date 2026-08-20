-- Nivaro Core 2026-08-18
-- Fail-closed market compliance, evidence, registry intelligence and automated offer visibility.

create extension if not exists "pgcrypto";

alter table public.casino add column if not exists region_codes text[] not null default '{}';
alter table public.bonus add column if not exists eligible_regions text[] not null default '{}';
alter table public.promo_code add column if not exists eligible_regions text[] not null default '{}';

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

alter table public.casino_market_compliance add column if not exists listing_allowed boolean not null default false;
alter table public.casino_market_compliance add column if not exists review_allowed boolean not null default false;
alter table public.casino_market_compliance add column if not exists affiliate_cta_allowed boolean not null default false;
alter table public.casino_market_compliance add column if not exists seo_index_allowed boolean not null default false;
alter table public.casino_market_compliance add column if not exists exact_domain_match boolean not null default false;
alter table public.casino_market_compliance add column if not exists exact_operator_match boolean not null default false;
alter table public.casino_market_compliance add column if not exists registry_status text;
alter table public.casino_market_compliance add column if not exists evidence_confidence numeric(5,2) not null default 0;
alter table public.casino_market_compliance add column if not exists last_checked_at timestamptz;
alter table public.casino_market_compliance add column if not exists next_check_at timestamptz;
alter table public.casino_market_compliance add column if not exists last_error text;
create index if not exists casino_market_compliance_market_status_idx on public.casino_market_compliance(market_code,status);

create table if not exists public.market_registry_entry (
  id uuid primary key default gen_random_uuid(), market_code text not null check (market_code in ('gb','dk','ontario')),
  operator_name text, trading_name text, domain text not null, licence_number text,
  regulator_name text not null, regulator_source_url text not null, source_record_url text,
  active boolean not null default true, source_hash text,
  first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), last_checked_at timestamptz not null default now(),
  unique(market_code, domain)
);
create index if not exists market_registry_entry_lookup_idx on public.market_registry_entry(market_code,domain,active);

create table if not exists public.market_registry_sync (
  id uuid primary key default gen_random_uuid(), market_code text not null check (market_code in ('gb','dk','ontario')),
  regulator_name text not null, source_url text not null,
  status text not null default 'pending' check (status in ('pending','running','success','partial','failed')),
  entries_seen integer not null default 0, entries_changed integer not null default 0,
  source_hash text, error text, started_at timestamptz not null default now(), finished_at timestamptz
);

create table if not exists public.evidence_snapshot (
  id uuid primary key default gen_random_uuid(), casino_id uuid references public.casino(id) on delete cascade,
  bonus_id uuid references public.bonus(id) on delete cascade, market_code text,
  evidence_type text not null, field_key text,
  source_kind text not null check (source_kind in ('regulator','affiliate','official_site','official_terms','official_offer','other')),
  source_url text not null, source_title text, extracted_value jsonb, content_hash text,
  status text not null default 'current' check (status in ('current','stale','conflict','unreachable','superseded')),
  confidence numeric(5,2) not null default 0, checked_at timestamptz not null default now(), expires_at timestamptz,
  metadata jsonb not null default '{}'
);
create index if not exists evidence_snapshot_casino_idx on public.evidence_snapshot(casino_id,checked_at desc);
create index if not exists evidence_snapshot_bonus_idx on public.evidence_snapshot(bonus_id,checked_at desc);
create index if not exists evidence_snapshot_market_idx on public.evidence_snapshot(market_code,evidence_type,checked_at desc);

create table if not exists public.bonus_market_compliance (
  id uuid primary key default gen_random_uuid(), bonus_id uuid not null references public.bonus(id) on delete cascade,
  market_code text not null check (market_code in ('gb','dk','ontario')),
  status text not null default 'pending' check (status in ('pending','approved','blocked','needs_legal_review')),
  public_promotion_allowed boolean not null default false, affiliate_cta_allowed boolean not null default false,
  evidence_notes text, regulator_source_url text, partner_terms_url text,
  last_checked_at timestamptz, next_check_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(bonus_id, market_code)
);
create index if not exists bonus_market_compliance_lookup_idx on public.bonus_market_compliance(market_code,status,public_promotion_allowed);

create table if not exists public.promo_code_market_compliance (
  id uuid primary key default gen_random_uuid(), promo_code_id uuid not null references public.promo_code(id) on delete cascade,
  market_code text not null check (market_code in ('gb','dk','ontario')),
  status text not null default 'pending' check (status in ('pending','approved','blocked','needs_legal_review')),
  public_promotion_allowed boolean not null default false, affiliate_cta_allowed boolean not null default false,
  evidence_notes text, last_checked_at timestamptz, next_check_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(promo_code_id, market_code)
);
create index if not exists promo_code_market_compliance_lookup_idx on public.promo_code_market_compliance(market_code,status,public_promotion_allowed);

create table if not exists public.smart_import_run (
  id uuid primary key default gen_random_uuid(), casino_id uuid references public.casino(id) on delete set null,
  affiliate_url text not null, resolved_url text,
  status text not null default 'running' check (status in ('running','completed','partial','needs_review','failed')),
  facts_found integer not null default 0, facts_verified integer not null default 0, offers_found integer not null default 0, markets_approved integer not null default 0,
  warnings jsonb not null default '[]', sources jsonb not null default '[]', started_at timestamptz not null default now(), finished_at timestamptz
);

create index if not exists casino_market_due_idx on public.casino_market_compliance(next_check_at) where status in ('approved','needs_legal_review','pending');

insert into storage.buckets (id,name,public) values ('casino-assets','casino-assets',true)
on conflict (id) do update set public=excluded.public;
