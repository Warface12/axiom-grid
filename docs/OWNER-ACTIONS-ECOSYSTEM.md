# Ecosystem owner actions

These are required before production commercial/email/payment features go live. Architecture is in place; values are not invented.

## Database
Apply in Supabase (in order if not already applied):

- `supabase/migrations/20260907_toppick_ops_import_geo.sql`
- `supabase/migrations/20260907_toppick_catalog_kinds.sql`
- `supabase/migrations/20260907_toppick_partner_ready.sql`
- `supabase/migrations/20260907_toppick_kind_explorer_tax.sql`
- `supabase/migrations/20260907_toppick_ecosystem.sql`

## Auth
- Enable Supabase Auth email (password or magic link).
- Set `NEXT_PUBLIC_AUTH_GOOGLE=true` only after Google OAuth is actually connected.
- Set `NEXT_PUBLIC_AUTH_APPLE=true` only after Apple Sign In is actually connected.

## Email / outreach
- `RESEND_API_KEY` and `EMAIL_FROM`, or SMTP later.
- Until then, applications are stored and email is queued as `skipped`.
- Auto-outreach remains off. Discovery cron is a no-op until an allow-list is configured.

## Conversion tracking
- `CONVERSION_WEBHOOK_PEPPER` for HMAC postbacks.
- Per-company `integration_endpoint.secret_hash`.
- Test events must use `environment=test` and never enter commission.

## Payments
- Do not add production wallet addresses in git.
- Configure a processor or Admin reconciliation before marking invoices paid.

## Advertising prices
- Insert real `ad_product` rows in Admin/SQL. No public prices are seeded.
