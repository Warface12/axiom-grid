create extension if not exists pgcrypto;
create table if not exists platform (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind text not null check (kind in ('exchange','broker','wallet')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table platform add column if not exists short_description text;
alter table platform add column if not exists full_review text;
alter table platform add column if not exists official_url text;
alter table platform add column if not exists affiliate_url text;
alter table platform add column if not exists affiliate_partner_id text;
alter table platform add column if not exists logo_url text;
alter table platform add column if not exists status text default 'research';
alter table platform add column if not exists custody_model text;
alter table platform add column if not exists tags text[] default '{}';
alter table platform add column if not exists fee_summary text;
alter table platform add column if not exists security_summary text;
alter table platform add column if not exists regulatory_summary text;
alter table platform add column if not exists product_summary text;
alter table platform add column if not exists pros text[] default '{}';
alter table platform add column if not exists cons text[] default '{}';
alter table platform add column if not exists seo_title text;
alter table platform add column if not exists seo_description text;
alter table platform add column if not exists featured boolean default false;
alter table platform add column if not exists visible boolean default false;
alter table platform add column if not exists verified_at timestamptz;
alter table platform add column if not exists last_checked_at timestamptz;
create index if not exists platform_kind_idx on platform(kind);
create index if not exists platform_visible_idx on platform(visible,status);
