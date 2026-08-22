# TopPick market visibility + partner update publishing

## Automatic country visibility
TopPick now resolves a visitor market from Vercel country headers. A user can manually override the market selector; the choice is stored in a first-party cookie and never forces a redirect.

Public platform listings are fail-closed:
- `platform.visible = true` is necessary but not sufficient.
- A current `platform_market` row must exist for the visitor country.
- `status = approved` and `product_available = true` are required for the platform to appear.
- Missing, expired, restricted or unknown market data hides the platform.
- Region-specific rows can override a country-level fallback where a region header is available.
- A partner CTA additionally requires `commercial_allowed = true`.

This deliberately separates research visibility from commercial promotion.

## Partner updates in Admin
Admin → Editorial & Updates can create source-linked posts for a partner:
- partner update
- bonus / offer update
- product update
- market update
- editorial note

Each update requires a platform, title, body and source URL. Optional market codes can narrow a post further. Even when an update is published, it only appears where the linked platform has approved product availability.

## Claim safety
The API blocks common unsupported promise language such as guaranteed outcomes, risk-free claims, absolute “best/#1” claims, easy/instant-profit wording and similar outcome promises. This is an editorial safeguard, not a substitute for legal review.

## Database
Run `supabase/migrations/20260822_toppick_partner_posts_geo_visibility.sql` after the earlier migrations.

### Region override rule
If a provider has a region/province-specific row (for example a province restriction), that row takes precedence over the country fallback. A restricted or expired regional row therefore hides the platform even when the country-level row is approved.
