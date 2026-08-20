# Axiom Grid — Crypto / Trading Comparison Project

A separate Next.js 15 project derived from the proven technical foundation of the NivaroBet codebase, but intentionally rebuilt with a different information architecture, visual system and data model.

## Important separation rule
Do **not** reuse NivaroBet production Supabase credentials, Vercel project, environment variables or database. Create a new project and new secrets for this site.

## What is included
- Light futuristic responsive design with CSS-only depth/glass effects (no heavy WebGL/3D dependency)
- Exchanges / Brokers / Wallets separated into distinct topic hubs
- Platform research pages, comparisons, Learn hub and Markets scaffold
- Canonical metadata, robots.txt, sitemap.xml, Open Graph and JSON-LD foundations
- Evidence-first / fail-closed market publishing model
- Redesigned admin dashboard and platform/SEO/market/monitoring workspaces
- New Supabase starter schema for platforms and market compliance
- Seed/demo content that keeps affiliate CTAs OFF until facts and market eligibility are verified

## SEO strategy used
The implementation benchmarks recurring structural patterns visible on strong finance/crypto publishers: clear topic hubs, comparison intent pages, editorial methodology, educational support content, prominent risk/context fields, internal linking and review criteria. No competitor article copy was duplicated.

## Run locally
1. Copy `.env.example` to `.env.local` and set a final site name + URL.
2. `npm run dev`
3. Open `http://localhost:3000`

## Before production launch
1. Choose the final brand/domain and set `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_SITE_URL`.
2. Create a **new** Supabase project and apply `supabase/schema.sql`.
3. Replace demo seed data with source-backed platform records.
4. Verify market availability and affiliate promotion eligibility before any commercial CTA is enabled.
5. Expand guide scaffolds into original source-backed editorial content.
6. Add Search Console verification after the final domain is live.
7. Replace legal placeholders with policies matching the services actually enabled.
