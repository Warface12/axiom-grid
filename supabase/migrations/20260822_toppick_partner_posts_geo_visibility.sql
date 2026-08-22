create table if not exists public.partner_post(
 id uuid primary key default gen_random_uuid(),
 platform_id uuid not null references public.platform(id) on delete cascade,
 slug text unique not null,
 title text not null,
 excerpt text,
 body text not null,
 post_type text not null default 'partner_update' check(post_type in('partner_update','bonus_update','product_update','market_update','editorial_note')),
 bonus_label text,
 terms_summary text,
 source_url text not null,
 market_codes text[] not null default '{}',
 published boolean not null default false,
 published_at timestamptz,
 valid_until timestamptz,
 seo_title text,
 seo_description text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists partner_post_public_idx on public.partner_post(published,published_at desc);
create index if not exists partner_post_platform_idx on public.partner_post(platform_id,updated_at desc);
alter table public.partner_post enable row level security;
