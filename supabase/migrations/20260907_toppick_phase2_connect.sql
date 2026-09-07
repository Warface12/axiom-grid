-- Phase 2 connections: consumer interests, partner invites, destination review, placement inventory.
-- Additive. No seed partners, prices, wallet addresses, or fake metrics.

alter table if exists public.user_profile
  add column if not exists interests text[] not null default '{}';

alter table if exists public.campaign
  add column if not exists destination_status text not null default 'pending_review';

alter table if exists public.campaign
  add column if not exists creative_notes text;

create table if not exists public.partner_invite (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platform(id) on delete cascade,
  email text not null,
  role text not null,
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  created_at timestamptz not null default now(),
  unique (platform_id, email)
);

alter table public.partner_invite enable row level security;

insert into public.ad_inventory (placement, slot_limit, exclusive, status)
values
  ('homepage', 1, true, 'active'),
  ('category', 2, false, 'active'),
  ('search', 2, false, 'active'),
  ('compare', 1, false, 'active'),
  ('research', 1, false, 'active'),
  ('markets', 1, false, 'active'),
  ('opportunities', 2, false, 'active'),
  ('games', 1, false, 'active'),
  ('app', 1, false, 'active'),
  ('email', 1, false, 'active')
on conflict (placement) do nothing;
