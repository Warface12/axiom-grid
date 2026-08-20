# Axiom Grid — Void Terminal full-theme patch

This patch intentionally makes Axiom Grid visually different from NivaroBet.

What changes:
- Public site: graphite/black research-terminal theme, hard-edged panels, electric cyan + signal green, animated radar/chain nodes/crypto tokens, reduced rounded/glass casino-style UI.
- Header: no public Admin/Control Room button.
- Empty exchange/broker/wallet directories: no public link to `/admin`.
- Shared inner pages inherit the new terminal theme.
- Admin: redesigned as a dedicated operations terminal, responsive on mobile.
- Partner Inventory: working Add/Edit/Delete via `/api/admin/platforms`.
- Partner form expanded with affiliate URL/ID, official URL, logo, custody, fees, security, regulatory context, product summary, full review, pros/cons and SEO fields.
- Publish remains fail-closed: new partners default to Research + Hidden.

## Apply
Copy everything in this ZIP into the Axiom project root and choose Replace.

## Database
Run once in Supabase SQL Editor:
`supabase/migrations/20260820_axiom_partner_inventory.sql`

## Vercel environment variables required for Partner Inventory
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Verify before push
npm run typecheck
npm run build

## Push
git add .
git commit -m "Axiom Grid void terminal full redesign"
git push origin main

Security note: hiding an Admin link is not authentication. Protect `/admin` with real authentication before treating it as private production access.
