# NivaroBet Full Update — 2026-08-15

## What this build changes

- Deep graphite/steel/crimson 3D visual refresh using CSS-only effects and low-frequency micro-animation.
- Smaller casino-card logos with a lightweight orbit detail; no video/WebGL/canvas added.
- Current NivaroBet steel/crimson brand mark used in public header/footer and Admin, including mobile Admin and login.
- Public empty sections stay hidden when no real data exists.
- Casino directory is paginated (24 per page) for scale.
- Admin casino directory is paginated (50 per page) and mobile tables collapse into readable cards.
- GEO system prepared for many countries/languages with flags; Canada includes Ontario and Alberta.
- GEO pages are noindex / omitted from sitemap until real partner availability exists.
- Localized market copy added for English, German, French, Spanish, Italian, Dutch, Portuguese, Swedish, Norwegian, Danish and Finnish.
- Footer country links only appear for active casino markets/regions.
- Casino review pages now prioritize current offers and promo codes, include copyable promo codes, payout/payment facts, rating breakdown, verification freshness and conditional table-of-contents links.
- Bonus detail pages include offer facts, copyable code, eligibility, how-to-claim steps, terms links and responsible-gambling notice.
- Compare tool expanded with payout speed, withdrawal limits, KYC, payments, licensing, mobile/live chat, GEO and bonus features.
- AI Import uses Gemini 3.5 Flash Lite fallback and extracts structured bonus/promo suggestions from verified public sources.
- AI Import never fills unsupported facts and can populate country/region data, including explicit Ontario/Alberta evidence.
- Monitoring keeps hash-first behavior and calls Gemini only when source content changes.
- Monitoring can safely update verified bonus/promo records; changed promo codes update a matching offer title rather than silently leaving an old code active.
- Monitoring also supports explicit min-deposit, payout-speed and withdrawal-limit changes when strongly verified.
- Search Console metrics sync is wired to Admin → SEO & Search and daily cron.
- Daily SEO Automation uses Search Console opportunity data to prioritize pages with real impressions / ranking opportunity.
- Search Console Needs Review suggestions can be approved/rejected in Admin.
- Sitemap includes only active GEO markets and active region pages, plus public casino/bonus/guide URLs.
- Scale indexes added for public casino listing, monitoring due checks, bonus/promo lookup and Search Console data.

## Required Supabase step

Run this migration once in Supabase SQL Editor:

`supabase/migrations/20260815_nivarobet_full_update.sql`

Do not run it repeatedly while another deployment is changing the same schema. The statements are written to be safe/idempotent where practical.

## Required Vercel environment variables

Copy names from `.env.example` and keep real values only in Vercel/local `.env.local`.

Minimum production variables:

- `NEXT_PUBLIC_SITE_URL=https://nivarobet.best`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-3.5-flash-lite`

Search Console variables are documented in `SEARCH_CONSOLE_SETUP.md`.

## Local verification before push

On the user's computer, from the updated project folder:

```powershell
npm install
npm run build
```

Only push after the build succeeds.

## Git push

```powershell
git add .
git commit -m "NivaroBet full GEO SEO design and monitoring update"
git push
```

Wait for Vercel Production deployment to show Ready.

## Important data note

This source ZIP does not contain the live Supabase rows or production secrets. Existing casino records cannot be safely enriched offline without seeing their exact live data. The updated AI Import workflow is designed so the admin can paste a real affiliate URL, review the extracted draft, and save verified public data. Unsupported fields remain blank / Needs Review rather than being invented.
