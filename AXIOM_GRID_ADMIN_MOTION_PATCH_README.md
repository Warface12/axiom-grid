# Axiom Grid Admin + Motion Patch — 2026-08-20

This patch is designed to be copied over the existing Axiom Grid project root.

## Changes
- Removed the public **Control room** button from the site header.
- Removed the public homepage CTA that linked directly to `/admin`.
- Added lightweight crypto motion to the hero (BTC / ETH / SOL floating nodes + animated network points). Uses CSS transform/opacity only and respects `prefers-reduced-motion`.
- Rebuilt Admin → Partner inventory as a real add/edit/delete interface.
- Added an Admin API backed by the existing Supabase `platform` table.
- Restyled admin tables, panels, inventory and partner modal to match the Axiom Grid terminal aesthetic instead of white generic cards.
- Partner intake includes official URL, affiliate URL, partner ID, platform type, status, custody, description, logo URL, tags, featured and public visibility controls.
- New records remain fail-closed by default: `visible=false`, `status=research` until explicitly changed.

## Required Vercel variables for partner saving
The project already includes the Supabase schema. For Admin → Partner inventory to save records, Vercel must contain:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service role key in client-side code. This patch uses it only in the server API route.

## Validation
`npm run typecheck` passes.

`npm run build` could not complete in the ChatGPT Linux sandbox because the supplied project contains Windows node_modules and does not include the Linux Next.js SWC binary. Run `npm install` then `npm run build` on your machine before pushing.
