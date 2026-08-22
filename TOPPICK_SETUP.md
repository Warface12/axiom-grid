# TopPick.pro deployment checklist

## 1. Branding
The public and admin UI now use **TopPick.pro** and the selected minimalist TP + checkmark identity. `NEXT_PUBLIC_SITE_URL` should be `https://toppick.pro`.

## 2. Fix admin login
In Vercel → Project → Settings → Environment Variables add:
- `ADMIN_EMAIL` — the private admin email you want to use.
- `ADMIN_PASSWORD` — a strong password. It is read only on the server and should not be committed to Git.
- `ADMIN_SESSION_SECRET` — a long random secret (at least 32 random characters).

Keep the existing Supabase variables too. The login now uses a signed HTTP-only server session, while existing Supabase Auth remains a fallback.

## 3. Database update
Run once in Supabase SQL Editor:
`supabase/migrations/20260822_toppick_brand_admin_seo.sql`

Do not paste service-role keys into client code.

## 4. Partner inventory
Admin → Inventory → Add partner.
The fast editor keeps the essential fields open and hides research/SEO details until needed. New records remain hidden by default. Mark a record **Featured near top** to surface it near the beginning. If an `XM` public record exists, the public partner strip prioritizes it automatically.

## 5. Compliance behavior
- `visible=false` is the default for new records.
- `restricted` records are never returned by public platform queries.
- Affiliate CTA appears only when a public record is `verified` and has an affiliate URL.
- `platform_market` is prepared for per-country/region evidence and fail-closed promotion rules.
- Public copy clearly separates editorial research from affiliate compensation and states that availability varies by jurisdiction.

## 6. SEO / Search Console
Technical SEO includes canonical URLs, dynamic sitemap, robots rules, Google verification, Organization/WebSite/Breadcrumb/Review/FAQ structured data and Search Console metric import.

Recommended Search Console property:
`sc-domain:toppick.pro`

The daily Vercel cron calls `/api/search-console/run` at 04:00 UTC. Set `CRON_SECRET` and either Search Console service-account credentials or OAuth refresh-token credentials.

Admin → SEO & Search shows configuration and ranking opportunities after the first sync.

## 7. Build test
Run:
```bash
npm install
npm run typecheck
npm run build
```
Only push after both checks succeed.
