-- Additive, production-safe alignment for GEO, affiliate routing, import provenance and uniqueness.

create extension if not exists pgcrypto;

-- Reconcile older platform_market shape (country_code / promotion_allowed) with the current app model.
alter table if exists public.platform_market add column if not exists market_code text;
alter table if exists public.platform_market add column if not exists product_available boolean not null default false;
alter table if exists public.platform_market add column if not exists commercial_allowed boolean not null default false;
alter table if exists public.platform_market add column if not exists status text;
alter table if exists public.platform_market add column if not exists notes text;
alter table if exists public.platform_market add column if not exists reviewed_at timestamptz;
alter table if exists public.platform_market add column if not exists expires_at timestamptz;
alter table if exists public.platform_market add column if not exists affiliate_url text;
alter table if exists public.platform_market add column if not exists campaign_subid text;
alter table if exists public.platform_market add column if not exists legal_notice text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'platform_market' and column_name = 'country_code'
  ) then
    update public.platform_market
      set market_code = coalesce(nullif(market_code, ''), country_code)
      where market_code is null or market_code = '';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'platform_market' and column_name = 'promotion_allowed'
  ) then
    update public.platform_market
      set commercial_allowed = promotion_allowed
      where commercial_allowed is false and promotion_allowed is true;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'platform_market' and column_name = 'research_status'
  ) then
    update public.platform_market
      set status = case
        when research_status = 'approved' then 'approved'
        when research_status = 'restricted' then 'restricted'
        else coalesce(nullif(status, ''), 'review')
      end
      where status is null or status = '';
    update public.platform_market
      set product_available = true
      where research_status = 'approved' and product_available is false;
  end if;
end $$;

update public.platform_market set status = coalesce(nullif(status, ''), 'review') where status is null or status = '';
update public.platform_market set market_code = upper(market_code) where market_code is not null;

create unique index if not exists platform_slug_unique_idx on public.platform (slug);
create index if not exists platform_kind_visible_idx on public.platform (kind, visible, featured, updated_at desc);
create index if not exists platform_market_code_idx on public.platform_market (market_code, status, product_available);

alter table if exists public.platform add column if not exists ranking_priority integer not null default 0;
alter table if exists public.platform add column if not exists affiliate_campaign text;
alter table if exists public.platform add column if not exists og_image_url text;
alter table if exists public.platform add column if not exists import_source_url text;
alter table if exists public.platform add column if not exists import_retrieved_at timestamptz;
alter table if exists public.platform add column if not exists import_provenance jsonb not null default '{}'::jsonb;

create table if not exists public.platform_import_draft (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  final_url text,
  hostname text,
  payload jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  duplicate_platform_id uuid references public.platform(id) on delete set null,
  status text not null default 'needs_review',
  created_at timestamptz not null default now()
);
alter table public.platform_import_draft enable row level security;
create index if not exists platform_import_draft_host_idx on public.platform_import_draft (hostname, created_at desc);
