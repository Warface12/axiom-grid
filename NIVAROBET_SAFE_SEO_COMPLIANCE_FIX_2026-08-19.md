# NivaroBet Safe SEO + Compliance Fix — 2026-08-19

Implemented:
- Generic casino `Verified` UI removed from Admin and public casino cards/profile.
- Public visibility remains fail-closed and is driven by `casino_market_compliance`.
- Casino manual form no longer accepts legacy country tags as approval.
- Current six casino slugs are included in a one-time Ontario fail-closed migration.
- Dynamic `<html lang>` now follows localized market URLs, fixing hreflang/HTML-lang mismatch.
- Sitemap no longer publishes GEO-gated global casino detail URLs that can return 4XX to crawlers.
- Sitemap market URLs are emitted only from explicit `seo_index_allowed` approved market rows.
- About page linked from footer to remove orphan-page condition.
- Metadata descriptions are normalized to useful lengths; key short descriptions expanded.
- Complete Open Graph/Twitter metadata remains centralized via `buildMetadata`; default OG asset added.
- Dedicated 48x48 favicon added so Google has a stable crawlable favicon URL.

Database step after deployment:
Run `supabase/SAFE_MARKET_MIGRATION_2026_08_19.sql` once in the Supabase SQL editor, then run Nivaro Core registry/compliance evaluation.
