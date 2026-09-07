-- Expand kinds for explorers and tax/accounting tools.
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
  'exchange','dex','broker','trading-platform','wallet','defi','staking','crypto-card','onramp','tool','explorer','tax'
));
