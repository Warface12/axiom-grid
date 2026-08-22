# TopPick Research OS — Major Update

This release expands TopPick as a distinct evidence-led research platform with its own graphite, ice-blue and cyan visual language.

## Core architecture
- Fail-closed market eligibility for commercial partner links.
- `platform_market` records separate product availability from promotion permission.
- `evidence_source` stores source provenance and freshness.
- `affiliate_click` provides server-side commercial click audit.
- `monitor_run` / `monitor_finding` detect stale research and expired market approvals.
- Search Console and SEO recommendation loop operates on observed data.
- Public search endpoint indexes only visible, non-restricted records.

## SEO
- Canonical metadata and social cards.
- JSON-LD organization / website / web page / FAQ / breadcrumb / item list / review helpers.
- Dynamic sitemap for public platforms and research-market pages.
- robots route and Google verification support.
- Search Console daily sync and recommendation prioritization.
- Editorial policy, corrections, risk disclosure and market framework improve trust and information architecture.

## Design
- TopPick remains a graphite / ice-blue / cyan research-terminal brand.
- Light and dark themes.
- Responsive mobile navigation.
- Rounded translucent panels and evidence cards.
- Motion is lightweight CSS-only and respects `prefers-reduced-motion`.
- New Research OS node map, trust strip, proof grid and enhanced control-plane console.

## Deployment
Apply Supabase schema and all migrations, configure environment variables, run `npm install`, `npm run typecheck`, `npm run build`, then deploy.
