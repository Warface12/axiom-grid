-- Expand platform kinds and add category-specific + verification fields.
-- Additive. Does not seed partners.

do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.platform'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%kind%'
  loop
    execute format('alter table public.platform drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.platform add constraint platform_kind_allowed check (kind in (
  'exchange','dex','broker','trading-platform','wallet','defi','staking','crypto-card','onramp','tool'
));

alter table public.platform add column if not exists subcategory text;
alter table public.platform add column if not exists attributes jsonb not null default '{}'::jsonb;
alter table public.platform add column if not exists verification_status text not null default 'needs_review';
alter table public.platform add column if not exists last_verified_at timestamptz;
alter table public.platform add column if not exists operator_name text;
alter table public.platform add column if not exists founded_year integer;
alter table public.platform add column if not exists cover_url text;
alter table public.platform add column if not exists languages text[] not null default '{}';
alter table public.platform add column if not exists editorial_score numeric;
alter table public.platform add column if not exists archived boolean not null default false;
alter table public.platform add column if not exists source_notes text;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.platform'::regclass
      and conname = 'platform_verification_allowed'
  ) then
    alter table public.platform drop constraint platform_verification_allowed;
  end if;
end $$;

alter table public.platform add constraint platform_verification_allowed
  check (verification_status in ('needs_review','imported','manual','verified','stale','missing'));

create index if not exists platform_kind_verify_idx on public.platform (kind, verification_status, archived, visible);
create index if not exists platform_archived_idx on public.platform (archived, updated_at desc);
