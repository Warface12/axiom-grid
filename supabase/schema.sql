-- Axiom Grid starter schema. Create this in a NEW Supabase project.
create extension if not exists pgcrypto;
create table if not exists platform (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind text not null check (kind in ('exchange','broker','wallet')),
  short_description text,
  full_review text,
  official_url text,
  affiliate_url text,
  affiliate_partner_id text,
  logo_url text,
  status text not null default 'research' check (status in ('research','verified','restricted')),
  custody_model text,
  tags text[] not null default '{}',
  fee_summary text,
  security_summary text,
  regulatory_summary text,
  product_summary text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  seo_title text,
  seo_description text,
  featured boolean not null default false,
  visible boolean not null default false,
  verified_at timestamptz,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists market_compliance (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references platform(id) on delete cascade,
  market_code text not null,
  status text not null default 'review' check(status in ('review','approved','restricted')),
  listing_allowed boolean not null default false,
  review_allowed boolean not null default false,
  affiliate_cta_allowed boolean not null default false,
  seo_index_allowed boolean not null default false,
  evidence_url text,
  evidence_note text,
  last_checked_at timestamptz,
  unique(platform_id,market_code)
);
create table if not exists guide (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  excerpt text, content text not null default '', category text, tags text[] not null default '{}',
  seo_title text, seo_description text, published boolean not null default false,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists platform_kind_idx on platform(kind);
create index if not exists platform_visible_idx on platform(visible,status);
create index if not exists market_compliance_market_idx on market_compliance(market_code,status);
