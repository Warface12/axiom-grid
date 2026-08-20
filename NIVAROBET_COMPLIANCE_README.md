# NivaroBet Compliance Architecture — 2026-08

This source build is intentionally conservative. It is not a legal opinion.

## Georgia access rule (development default: OFF)
- Georgia blocking is controlled by `GE_BLOCK_ENABLED`. It is OFF by default during development/testing. Set `GE_BLOCK_ENABLED=true` in Vercel only when you intentionally want to enable the public Georgia block.
- `/admin/login` remains reachable so the authenticated owner can sign in.
- Once the Supabase user email matches `ADMIN_EMAIL`, the owner can use both the normal public site and Admin from Georgia.
- Do not create a public bypass query string or IP whitelist.

## Initial active market strategy
The code keeps only three initial targets in the selector/market architecture:
1. United Kingdom (`GB`)
2. Denmark (`DK`)
3. Ontario, Canada (`CA` + region `ontario`)

Canada as a whole is NOT treated as one approved gambling market. Ontario is handled separately.

## Fail-closed publishing rule
- Casino must be `active`, `visible`, and `verification_status = verified`.
- Public casino lists are market-filtered.
- Unsupported visitor markets receive no casino inventory by default.
- AI Import does not auto-apply country/region approvals.
- `casino_market_compliance` stores regulator/partner evidence and defaults to `pending`.
- Unknown/pending legal status should remain hidden; do not infer approval from an affiliate URL.

## Market notes used for this build
- UK: licensees are responsible for contracted affiliates/third parties and marketing must not mislead; significant promotion conditions must be prominent.
- Denmark: affiliates do not generally need a gambling licence merely to market a licensee, but gambling/consumer marketing rules also apply to affiliates and affiliates can incur liability. Do not promote unlicensed operators to Denmark.
- Ontario: use iGaming Ontario's current regulated operator/site directory as the minimum operator check. Ontario prohibits broad public advertising of bonuses/credits/inducements, so public bonus promotion must remain disabled unless a specific compliant placement has been reviewed.
- Georgia: public blocking is available as a configurable product policy but is intentionally disabled during development/testing. Before enabling it for production, confirm the final legal/compliance decision and set `GE_BLOCK_ENABLED=true`.

## Before production after this update
1. Run the appended `supabase/schema.sql` changes in Supabase SQL editor/migration flow.
2. Ensure `ADMIN_EMAIL` exists in Vercel production environment and exactly matches the owner's Supabase Auth email.
3. Verify Vercel supplies `x-vercel-ip-country` and `x-vercel-ip-country-region` in production.
4. For every casino, approve only markets supported by regulator evidence + affiliate/partner permission.
5. Keep evidence URL, review date, and expiry/recheck date.
6. Do not treat the words "Verified" or a high rating as a regulatory endorsement.
7. Obtain professional legal/tax advice before material revenue or expanding markets.

### Important migration behavior
The appended SQL backs up existing casino GEO tags into `casino_geo_legacy_backup` and then clears the live GEO tags. This is deliberate fail-closed behavior: old tags were not collected as legal approvals. Re-add `GB`, `DK`, or `CA + ontario` only after review. This can temporarily make public casino lists empty, which is safer than publishing an unreviewed operator in a regulated market.
