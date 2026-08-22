# TopPick.pro — Research OS Edition

TopPick.pro is an evidence-led comparison publisher for exchanges, brokers, wallets and trading platforms. This build is designed so the remaining operational work is primarily partner onboarding, source review and market approvals rather than rebuilding pages.

## What is included

- Distinct TopPick visual system with responsive light/dark themes, motion-safe data visuals, rounded research panels and mobile navigation.
- Exchange / broker / wallet directories, comparison, fees, security, research library, market framework and live public search.
- Fail-closed commercial routing: a partner link redirects only when a current `platform_market` approval exists for the visitor market.
- Evidence ledger, market eligibility, affiliate click audit, content revision history and monitoring tables.
- Daily stale-record / expired-approval monitoring.
- Search Console sync and recommendation-oriented SEO loop. It does not auto-publish unverified factual claims and does not use spam tactics.
- Canonicals, sitemap, robots, JSON-LD, dynamic metadata, market pages, editorial policy, corrections, risk disclosure and affiliate disclosure.
- Admin inventory foundation and Supabase-backed architecture.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and configure Supabase/admin/Search Console values.
3. Apply `supabase/schema.sql`, then migrations in `supabase/migrations/` in timestamp order.
4. `npm run typecheck`
5. `npm run build`
6. Deploy to Vercel and add the same environment variables there.

## Partner onboarding rule

Adding an affiliate URL alone does **not** make a public promotional link live. Create/approve the platform, attach reliable source evidence, then add a current `platform_market` row with `status='approved'` and `commercial_allowed=true` for each eligible market. Unknown or expired eligibility stays blocked.

## Important

TopPick.pro is a comparison publisher, not a broker, exchange, wallet provider or financial adviser. Public content should remain general information and should not promise returns, safety, regulatory status, product availability or suitability without current evidence.

## Market-aware publishing and partner updates
This build includes fail-closed country/region visibility for public platforms, a manual non-redirecting market override, separate commercial CTA approval, and an Admin → Editorial & Updates workflow for sourced partner/bonus/product posts. See `MARKET_VISIBILITY_AND_PARTNER_POSTS.md` and run the latest Supabase migration before using the feature.
