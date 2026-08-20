-- NivaroBet scalable GEO + Search Console update

alter table public.casino add column if not exists region_codes text[] not null default '{}';
alter table public.bonus add column if not exists eligible_regions text[] not null default '{}';
alter table public.promo_code add column if not exists eligible_regions text[] not null default '{}';

create index if not exists casino_country_codes_gin_idx on public.casino using gin(country_codes);
create index if not exists casino_region_codes_gin_idx on public.casino using gin(region_codes);
create index if not exists bonus_eligible_countries_gin_idx on public.bonus using gin(eligible_countries);
create index if not exists bonus_eligible_regions_gin_idx on public.bonus using gin(eligible_regions);

create table if not exists public.search_console_metric (
  id uuid primary key default gen_random_uuid(),
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
  unique(property, data_date, query, page, country, device)
);

create index if not exists search_console_metric_page_idx on public.search_console_metric(page);
create index if not exists search_console_metric_date_idx on public.search_console_metric(data_date desc);
create index if not exists search_console_metric_opportunity_idx on public.search_console_metric(impressions desc, position asc);

alter table public.search_console_metric enable row level security;
-- No public read policy. Service-role automation and authenticated admin tools only.

create table if not exists public.seo_automation_run (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'success',
  candidates_found integer not null default 0,
  targets_analyzed integer not null default 0,
  improvements_found integer not null default 0,
  changes_applied integer not null default 0,
  needs_review integer not null default 0,
  failures integer not null default 0,
  metadata jsonb not null default '{}',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_automation_change (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid,
  target_key text not null,
  field_name text not null,
  old_value text,
  new_value text,
  confidence numeric not null default 0,
  reason text,
  model text,
  status text not null default 'needs_review',
  created_at timestamptz not null default now(),
  applied_at timestamptz
);

alter table public.seo_automation_run enable row level security;
alter table public.seo_automation_change enable row level security;
create index if not exists seo_automation_change_status_idx on public.seo_automation_change(status, created_at desc);

-- Scale indexes for hundreds/thousands of casinos and monitored offers.
create index if not exists casino_public_directory_idx on public.casino(active, visible, featured, sort_order, rating desc);
create index if not exists casino_monitor_due_idx on public.casino(monitoring_enabled, next_check_at) where monitoring_enabled = true;
create index if not exists casino_monitor_status_idx on public.casino(monitoring_status);
create index if not exists bonus_casino_active_idx on public.bonus(casino_id, active, status, sort_order);
create index if not exists bonus_updated_idx on public.bonus(updated_at desc);
create index if not exists promo_code_casino_active_idx on public.promo_code(casino_id, active, status, sort_order);
create index if not exists promo_code_updated_idx on public.promo_code(updated_at desc);
create index if not exists monitoring_source_due_idx on public.casino_monitor_source(enabled, next_check_at) where enabled = true;
