# NivaroBet — Google Search Console setup

The project is prepared for both Search Console ownership verification and daily Search Analytics imports.

## 1. Add and verify the property

Recommended property: `sc-domain:nivarobet.best`.

Verify the domain in Google Search Console with the DNS TXT record provided by Google. Domain verification is the strongest option because it covers HTTP/HTTPS and subdomains.

The app also supports an HTML verification meta tag. Set this Vercel environment variable only if Google gives you a meta-tag verification token:

`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token only>`

Do not paste the whole `<meta>` tag.

## 2. Submit the sitemap

After production deployment, submit:

`https://nivarobet.best/sitemap.xml`

The sitemap is generated from active public casinos, bonuses, guides and GEO pages. Country/region pages are included only when corresponding verified partner data exists.

## 3. Search Console API for NivaroBet SEO Automation

Create a Google Cloud service account and enable the Search Console API. Add the service-account email as a user/owner with sufficient read access to the Search Console property.

Add these Vercel environment variables:

- `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL`
- `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:nivarobet.best`

The private key should be stored exactly as provided by Google. Newlines may be represented as `\n`; the server normalizes them.

## 4. Daily sync

`vercel.json` runs `/api/search-console/run` daily at 04:00 UTC. The route is protected by `CRON_SECRET`.

The sync stores query/page/country/device metrics in `search_console_metric`. Daily SEO Automation then boosts pages with meaningful impressions, positions roughly in striking distance, or low CTR.

## 5. Admin

Open `Admin → SEO & Search` to see:

- Search Console setup status
- manual sync button (when configured)
- Search Console opportunities
- Gemini SEO Needs Review changes
- recent SEO automation activity

## 6. Indexing checklist

After deploy:

1. Confirm `/robots.txt` loads.
2. Confirm `/sitemap.xml` loads and contains only canonical public URLs.
3. Submit the sitemap in Search Console.
4. Use URL Inspection on the home page, `/casinos`, and several real casino review pages.
5. Check Page Indexing for blocked, duplicate, canonical, redirect or not-found issues.
6. Do not mass-request indexing for empty GEO pages; they stay out of the sitemap until they have real partner content.
