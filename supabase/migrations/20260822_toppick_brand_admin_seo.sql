create extension if not exists pgcrypto;

alter table if exists public.platform add column if not exists verified_at timestamptz;
alter table if exists public.platform add column if not exists last_checked_at timestamptz;
create index if not exists platform_public_sort_idx on public.platform(visible, status, featured, updated_at desc);

create table if not exists public.platform_market (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  country_code text not null,
  region_code text not null default '',
  research_status text not null default 'unknown' check (research_status in ('unknown','approved','restricted','review')),
  promotion_allowed boolean not null default false,
  evidence_url text,
  evidence_note text,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(platform_id,country_code,region_code)
);
create index if not exists platform_market_lookup_idx on public.platform_market(country_code,region_code,research_status,promotion_allowed);
alter table public.platform_market enable row level security;

create table if not exists public.search_console_metric (
  property text not null,
  data_date date not null,
  query text not null default '',
  page text not null default '',
  country text not null default '',
  device text not null default '',
  clicks numeric not null default 0,
  impressions numeric not null default 0,
  ctr numeric not null default 0,
  position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(property,data_date,query,page,country,device)
);
create index if not exists search_console_metric_page_idx on public.search_console_metric(page);
create index if not exists search_console_metric_date_idx on public.search_console_metric(data_date desc);
create index if not exists search_console_metric_opportunity_idx on public.search_console_metric(impressions desc,position asc);
alter table public.search_console_metric enable row level security;

create table if not exists public.seo_run (
  id uuid primary key default gen_random_uuid(),
  run_type text not null default 'daily',
  status text not null default 'running',
  property text,
  metrics_synced int not null default 0,
  opportunities_found int not null default 0,
  notes jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
alter table public.seo_run enable row level security;


create table if not exists public.seo_recommendation (
  id uuid primary key default gen_random_uuid(),
  recommendation_key text unique not null,
  page text not null,
  query text,
  type text not null,
  priority int not null default 50,
  title text not null,
  reason text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'suggested' check (status in ('suggested','reviewed','applied','dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists seo_recommendation_priority_idx on public.seo_recommendation(status,priority desc,updated_at desc);
alter table public.seo_recommendation enable row level security;
