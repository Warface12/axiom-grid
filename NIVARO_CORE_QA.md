# Nivaro Core QA — 2026-08-18

## Smart Add invariants
- New casino onboarding requires only an Affiliate URL.
- Smart Import uses direct HTTP plus Firecrawl v2 rendered discovery/map/search fallbacks.
- Firecrawl branding output is used as the preferred logo source before favicon/OG fallbacks.
- The importer can detect an existing casino by slug/official URL and updates it instead of creating a duplicate.
- Smart Add auto-saves after collection; manual Save is not required for normal onboarding.
- New/imported records are fail-closed (`visible=false`) until market evaluation completes.

## Market/compliance invariants
- Global `visible` is derived from whether at least one supported market is fully approved.
- Market approval requires a current exact regulator domain match AND operator/trading-name match.
- Affiliate GEO approval cannot be inferred from a GEO-looking tracking-link token.
- Missing/stale/conflicting evidence is hidden, never published optimistically.
- Casino listing, review, affiliate CTA, bonus promotion and SEO indexing remain separate market gates.

## Offer invariants
- Bonus/promo discovery is system-owned; legacy manual bonus/promo pages redirect to monitoring.
- Offer discovery uses official promotion pages and rendered Firecrawl map/scrape fallback.
- Low-confidence offers remain `needs_review` and market-hidden.
- An incomplete crawl never deactivates prior offers; unseen offers age out only after repeated healthy discovery.

## Runtime/performance/accessibility
- Hourly Nivaro Core cron retained.
- Georgia block remains disabled unless `GE_BLOCK_ENABLED=true` is explicitly set.
- Header backdrop blur and several expensive continuous animations are disabled/reduced to lower scroll paint cost.
- Below-fold cards/sections use `content-visibility:auto`.
- Skip link and strong `:focus-visible` styles added.
- `prefers-reduced-motion` disables animation/transition motion.

## Checks performed
- `npx tsc --noEmit` passes.
- Source scan confirms no Firecrawl v1 endpoint remains in runtime code.
- Full `next build` was attempted in the artifact environment but cannot complete because the uploaded Windows `node_modules` lacks the Linux Next SWC binary and this container cannot reach npm to download it. This is an environment limitation, not a TypeScript/code error.
