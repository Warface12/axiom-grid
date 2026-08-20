# NivaroBet Smart Core Final Changes — 2026-08-18

This revision is based on the live Smart Add test that returned 20% confidence and `Needs Review` while still leaving `Visible` enabled.

## Corrected
- `Needs Review` / partial imports can no longer publish globally by default.
- Global casino visibility is now derived by the compliance engine: at least one fully approved supported market is required.
- Regulator verification no longer treats a domain match as an operator match. Both domain and operator/trading identity must match and registry evidence must be fresh.
- Affiliate GEO permission is no longer approved merely because a tracking URL contains `UK`, `DK`, `ON`, or another GEO-looking token.
- Firecrawl runtime upgraded from v1 to current v2 endpoints.
- Smart Import uses Firecrawl map/search/scrape discovery when guessed casino paths return 404 or JS/anti-bot shells.
- Firecrawl Branding output is used for official logo discovery, with favicon/OG fallback.
- Smart Add identifies existing casino records and updates them rather than creating avoidable duplicates.
- Normal Smart Add is now one-URL + automatic save. The advanced editor stays for exceptional corrections only.
- Initial offer discovery starts automatically after casino save; the owner does not need to create bonuses manually.
- Offer monitoring no longer trusts one guessed `/bonus` route; it maps the official site for current promotions and scrapes relevant pages.
- Incomplete/failed offer crawls cannot erase previous valid offers.
- Bonus/promo visibility remains tied to casino market compliance and separate public-promotion rules.

## Speed / accessibility hardening
- Removed expensive header backdrop blur.
- Disabled/reduced high-cost continuous animations on smaller viewports.
- Added `content-visibility:auto` for below-fold cards/sections.
- Added a keyboard skip link and visible focus outlines.
- Added stronger reduced-motion behavior.

## Unchanged intentionally
- Georgia remains open during testing. `GE_BLOCK_ENABLED=true` enables the prepared block later.
- SEO and existing AI/monitoring modules remain present; legal/market publication is not delegated to AI.
