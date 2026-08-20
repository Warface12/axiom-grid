# NivaroBet safety/compliance refactor

## Implemented
- Permanent Georgia public GEO block in Next middleware.
- Secure owner bypass tied to Supabase Auth + server-only `ADMIN_EMAIL`; owner can use public site and Admin from Georgia on any authenticated device/network.
- Fail-closed visitor market filtering.
- Initial market architecture narrowed to UK, Denmark, and Ontario (Ontario is treated separately from Canada-wide targeting).
- AI Import no longer auto-applies country/region approval fields.
- Public casino inventory now requires active + visible + verified status and a matching supported market tag.
- Outbound `/go/` affiliate redirect now re-checks visitor market and casino eligibility server-side.
- Added `casino_market_compliance` evidence/audit table (pending by default).
- Added one-time backup + clearing of legacy GEO tags so old tags are not silently treated as legal approvals.
- Removed broad "trusted/verified" marketing language from the homepage and changed badges toward "checked" wording.
- Strengthened affiliate disclosure and responsible-gambling copy; explicitly states NivaroBet is not a casino/gambling operator.
- Removed inactive country selector clutter; selector now exposes UK, Denmark, and Ontario rather than broad Canada.

## Official regulatory sources used for architecture research
- Georgia, Law on Advertising, Article 8³: https://www.matsne.gov.ge/en/document/view/31840
- UK Gambling Commission, affiliates/third parties: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/affiliates-or-third-parties
- UK Gambling Commission, LCCP 1.1.2: https://www.gamblingcommission.gov.uk/licensees-and-businesses/lccp/condition/1-1-2-responsibility-for-third-parties-all-licences
- UK Gambling Commission, LCCP 5.1.9: https://www.gamblingcommission.gov.uk/licensees-and-businesses/lccp/condition/5-1-9-other-marketing-requirements
- Denmark Gambling Authority, affiliate guidance (2025 guide): https://spillemyndigheden.dk/media/nwtdel0q/vejledning-om-vaeddemaal-og-onlinekasino-version-10-2025.pdf
- Denmark Gambling Authority, illegal gambling/advertising: https://spillemyndigheden.dk/en-us/public-and-players/illegal-gambling-and-advertising
- iGaming Ontario regulated operator/site directory: https://www.igamingontario.ca/en/operator/operators
- iGaming Ontario regulated market: https://www.igamingontario.ca/en/player/regulated-igaming-market

## Deployment checklist
1. Back up Supabase database.
2. Run the appended `supabase/schema.sql` migration in a controlled migration/SQL editor session. Note: it deliberately backs up and clears legacy casino GEO tags.
3. Set `ADMIN_EMAIL` in Vercel to the exact email of the owner's Supabase Auth account.
4. Deploy to Vercel.
5. Test from Georgia while logged out: public pages must show the region-unavailable screen.
6. Sign in at `/admin/login`; then test both `/admin` and the normal homepage from Georgia.
7. Test UK, Denmark and Ontario with real-location/Vercel geo headers before approving any casino.
8. Re-approve casino GEO tags only after regulator evidence and affiliate-program permission are documented.

## Validation
- TypeScript `tsc --noEmit`: PASS.
- Full Next production build could not complete in the isolated build environment because Next attempted to download its Linux SWC package from npm and outbound network access was unavailable. This was an environment/network limitation, not a TypeScript compile error.


## 2026-08-18 development access update
- Georgia public blocking is now OFF by default for development/testing.
- It can later be enabled without code changes by setting `GE_BLOCK_ENABLED=true` in Vercel.
