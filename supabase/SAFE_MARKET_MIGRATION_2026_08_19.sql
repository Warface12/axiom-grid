-- NivaroBet safety migration — run once in Supabase SQL editor.
-- Keeps casino rows in the master DB but removes generic verification semantics
-- from publication decisions and forces market visibility to fail closed.

update public.casino set visible = false;

update public.casino_market_compliance
set status = 'blocked',
    listing_allowed = false,
    review_allowed = false,
    affiliate_cta_allowed = false,
    seo_index_allowed = false,
    bonus_public_advertising_allowed = false,
    evidence_notes = coalesce(evidence_notes, 'Fail-closed migration: approval must be re-established from current regulator and affiliate evidence.'),
    updated_at = now()
where status <> 'approved'
   or operator_licensed is not true
   or affiliate_marketing_approved is not true;

-- Ontario: these six current NivaroBet records remain hidden unless a later official
-- registry + affiliate permission review explicitly approves them.
insert into public.casino_market_compliance (casino_id, market_code, status, operator_licensed, affiliate_marketing_approved, bonus_public_advertising_allowed, listing_allowed, review_allowed, affiliate_cta_allowed, seo_index_allowed, evidence_confidence, regulator_name, regulator_source_url, evidence_notes, updated_at)
select c.id, 'ontario', 'blocked', false, false, false, false, false, false, false, 0,
       'iGaming Ontario / AGCO', 'https://www.igamingontario.ca/en/operator/operators',
       'Fail-closed: Ontario listing is hidden until exact official operator/domain evidence and explicit affiliate permission are confirmed.', now()
from public.casino c
where lower(c.slug) in ('22casino','22bet','1xbet','safecasino','betlabel','azurslot')
on conflict (casino_id, market_code) do update set
  status='blocked', operator_licensed=false, affiliate_marketing_approved=false,
  bonus_public_advertising_allowed=false, listing_allowed=false, review_allowed=false,
  affiliate_cta_allowed=false, seo_index_allowed=false, evidence_confidence=0,
  evidence_notes=excluded.evidence_notes, updated_at=now();

-- Recompute master visibility from explicit approved market rows only.
update public.casino c
set visible = exists (
  select 1 from public.casino_market_compliance cmc
  where cmc.casino_id = c.id
    and cmc.status = 'approved'
    and cmc.listing_allowed = true
    and cmc.operator_licensed = true
    and cmc.affiliate_marketing_approved = true
), updated_at = now();
