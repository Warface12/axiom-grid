# NivaroBet Editorial Portal Update — 2026-08-20

## What changed
- Rebuilt the public header as a two-level editorial/research masthead instead of a standard logo + links navbar.
- Kept the NivaroBet logo, reduced its visual size, and retained the original brand mark.
- Split navigation into DISCOVER and INTELLIGENCE channels.
- Added compact utility rail for verification, editorial policy and responsible gambling.
- Rebuilt the home page into a larger research-style portal with distinct visual section types instead of repeating the same card layout.
- Added Market Desk, Payment Lens, Verification Lab and Change Desk channels.
- Added new /payments and /updates pages with original NivaroBet content.
- Existing casino, bonus, guide, market, compliance, admin and SEO infrastructure remains in the project.
- Mobile header collapses to logo + GEO selector + search + menu while preserving the new information architecture.

## Validation
- TypeScript: PASS (`node node_modules/typescript/bin/tsc --noEmit`).
- Next.js production build could not be completed in the Linux handoff environment because the uploaded Windows node_modules does not contain the Linux SWC binary and the environment cannot download it. Run `npm run build` on Windows or after a fresh `npm install`.
