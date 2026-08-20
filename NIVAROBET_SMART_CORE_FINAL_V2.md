# NivaroBet Smart Core Final V2 — 2026-08-18

This build hardens the one-URL Smart Add workflow after live production testing.

## Smart Add / Import
- One normal input remains: Affiliate URL.
- Affiliate redirects are resolved even when the final destination answers with Access Denied / geo restriction.
- A blocked destination is routing evidence only; it is not treated as trustworthy casino profile content.
- The resolved destination origin is used to discover official pages automatically.
- Firecrawl discovery uses one map pass per origin and parallel page scrapes instead of repeated sequential guesses.
- Search fallback is restricted to the resolved official host and is discovery-only.
- Gemini failure no longer aborts onboarding: deterministic extraction takes over safely.
- If a destination is temporarily inaccessible but a plausible official origin is resolved, Nivaro Core creates/updates a PRIVATE candidate and monitoring retries later. It is never published from incomplete evidence.
- Existing casinos are updated instead of duplicated. The hidden ID handoff bug that caused duplicate-slug errors has been fixed.
- Import completion wording now distinguishes source completeness from legal/market approval.

## Fail-closed publication
- New/updated casinos are forced globally invisible before market evaluation.
- Public casino pages require an approved `casino_market_compliance` record for the visitor's supported market.
- Unsupported/unknown visitor markets return zero casino listings rather than falling back to a global list.
- Global `casino.visible` is derived only from at least one fully approved market.
- Casino listing, review, affiliate CTA and offer promotion remain separate market gates.

## Offers
- Direct promotion URL checks are concurrent instead of sequential.
- Firecrawl promotion discovery uses one site map plus parallel rendered scrapes.
- Uncertain offers remain review-gated/hidden.
- Incomplete crawls never remove previously valid offers immediately.
- Bonuses and promo-code admin pages remain system-managed redirects; normal manual creation is removed from the casino workflow.

## Admin usability
- Casino list now links directly to Monitoring & Offers and Market Compliance.
- Delete action is available from the casino list.
- New Casino stays minimal; existing casinos retain the Advanced editor for exceptional corrections.

## Performance / accessibility
- Existing scroll-performance reductions are preserved.
- Firecrawl and direct-fetch time budgets were reduced and parallelized.
- Country/language selector received clearer accessible labeling.
- Reduced-motion and no-heavy-backdrop public overrides remain enabled.

## QA
- `npx tsc --noEmit` passes.
- `npm run qa:nivaro` passes the fail-closed architecture smoke checks.
- A full local `next build` cannot run in the current Linux workspace because the uploaded Windows `node_modules` does not contain Next.js Linux SWC binaries. Vercel installs the platform-correct dependencies during deployment.

Georgia blocking remains OFF by default for testing. `GE_BLOCK_ENABLED=true` enables the prepared public block later.
