# Production deploy checklist

## Before push
- `npm ci`
- `npm run typecheck`
- `npm run build`
- review `git diff` for secrets

## Supabase
- Apply `supabase/schema.sql` for a fresh database.
- Apply migrations in `supabase/migrations/` order, including `20260822_toppick_research_os.sql`.
- Keep the service-role key server-only.

## Vercel environment
- `NEXT_PUBLIC_SITE_URL=https://toppick.pro`
- Supabase URL + anon key + server-only service role
- admin credentials + long `ADMIN_SESSION_SECRET`
- `CRON_SECRET`
- Search Console credentials when available

## Search
- Verify the domain property in Google Search Console.
- Confirm `/robots.txt` and `/sitemap.xml`.
- Submit the sitemap.
- Inspect the home page and representative exchange/broker/wallet pages.

## Commercial safety
- Test a platform with no market approval: partner route must fail closed.
- Test an expired market approval: partner route must fail closed.
- Test an approved current market record: partner route may redirect.

## Performance / accessibility
- Check mobile and desktop Lighthouse/PageSpeed.
- Confirm reduced-motion behavior.
- Confirm keyboard focus, mobile menu and theme control.
