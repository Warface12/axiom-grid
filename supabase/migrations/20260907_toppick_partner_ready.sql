-- Partner-ready media, market copy, click placement and redirects.
-- Additive. Does not seed partners or affiliate URLs.

alter table if exists public.platform add column if not exists screenshots text[] not null default '{}';
alter table if exists public.platform add column if not exists cta_label text;
alter table if exists public.platform add column if not exists risk_notes text;

alter table if exists public.platform_market add column if not exists availability_status text;
alter table if exists public.platform_market add column if not exists cta_label text;
alter table if exists public.platform_market add column if not exists seo_title text;
alter table if exists public.platform_market add column if not exists seo_description text;

update public.platform_market
  set availability_status = case
    when status = 'restricted' then 'restricted'
    when status = 'approved' and product_available then 'available'
    when status = 'review' then 'needs_review'
    else coalesce(availability_status, 'unknown')
  end
  where availability_status is null or availability_status = '';

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.platform_market'::regclass
      and conname = 'platform_market_availability_allowed'
  ) then
    alter table public.platform_market drop constraint platform_market_availability_allowed;
  end if;
end $$;

alter table public.platform_market add constraint platform_market_availability_allowed
  check (availability_status in ('available','restricted','unknown','needs_review'));

alter table if exists public.affiliate_click add column if not exists placement text;
alter table if exists public.affiliate_click add column if not exists cta text;

create table if not exists public.seo_redirect (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  permanent boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.seo_redirect enable row level security;

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('platform-media', 'platform-media', true)
  on conflict (id) do nothing;
exception when others then
  null;
end $$;

create index if not exists platform_rank_idx on public.platform (visible, ranking_priority desc, featured desc, updated_at desc);
