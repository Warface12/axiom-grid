# Nivaro Core — final smart/compliance architecture

This project includes the Nivaro Core foundation as the source of truth for market publication.

## Normal casino onboarding

Admin → Casinos → New Casino now defaults to the simplified workflow:

1. Paste **Affiliate URL**.
2. Press **Import & Verify**.
3. Smart Import resolves the destination, crawls public official pages, discovers brand assets, prepares structured casino data and detected current offers.
4. Saving the record caches a discovered logo into Supabase Storage when possible, creates/updates detected offers, starts monitoring, creates evidence, and evaluates every active market.
5. A casino is NOT public merely because it exists in the master database.

Advanced fields remain available only when an exceptional manual correction is necessary.

## Fail-closed market model

Supported launch markets in this build:
- Ontario
- United Kingdom
- Denmark

For each casino and each market, Nivaro Core stores separate gates for:
- listing
- review page
- affiliate CTA
- public bonus promotion
- SEO indexing

No exact current official-registry domain match = HIDE.
Unclear affiliate GEO permission = HIDE / NEEDS LEGAL REVIEW.
Stale/conflicting evidence = HIDE.

Legacy country_codes/region_codes are preserved but are NOT public legal approval.

## Automated offers

Manual Bonus and Promo Code pages have been removed from the normal Admin workflow.
Nivaro Core monitors official promotion pages and, when extraction is sufficiently clear, creates/updates current offers and writes change history. Ambiguous offers stay needs_review. Market-specific offer compliance is always applied separately.

The public global Bonuses page is removed from navigation and legacy bonus URLs redirect into the relevant casino profile. Each casino profile owns its Current Offers / Promo Codes / evidence / change history.

## Evidence / change intelligence

Casino profiles can show:
- market confidence
- official evidence sources
- evidence check dates
- monitored change history

Admin → Market Compliance shows exactly what is SHOW/HIDE by market and why.

## 24/7 core

`/api/nivaro-core/run` is the protected scheduled worker. It:
- refreshes stale regulator registry data
- runs existing casino monitoring
- re-evaluates due market compliance
- checks current offers
- syncs bonus/promo market gates

`vercel.json` requests an hourly schedule. Your hosting plan/scheduler must support that cadence. The endpoint is protected by `CRON_SECRET`, so another reliable scheduler can call the same endpoint if needed.

## Required deployment steps

1. Run `supabase/migrations/20260818_nivaro_core.sql` in Supabase SQL Editor.
2. Keep existing `.env.local` values and ensure these server variables exist in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
   - `CRON_SECRET`
3. Recommended for JS-heavy/anti-bot casino websites:
   - `FIRECRAWL_API_KEY`
4. Gemini remains optional for richer text/data normalization. Smart Import has a deterministic fallback when Gemini is not configured. AI never grants market/legal approval.
5. Run `npm run build` locally before production push.

## Verification performed in the delivered source

- `npx tsc --noEmit` passes.
- Full Next production build could not finish inside the Linux packaging environment because Next attempted to download the Linux SWC binary from npm and outbound npm access was unavailable. The project already contains the user's Windows dependencies, so run `npm run build` on the user's normal machine before deployment.

## Important boundary

Nivaro Core minimizes compliance exposure with deterministic, fail-closed rules. It is not a substitute for jurisdiction-specific legal advice. A rule or affiliate contract that cannot be proven automatically remains hidden rather than guessed.
