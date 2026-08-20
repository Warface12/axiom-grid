# NivaroBet Radical Redesign — 2026-08-18

## Direction
- Preserved NivaroBet name, N mark/logo treatment and lightweight 3D brand motion.
- Rebuilt the public home experience as an editorial casino directory/comparison product rather than the previous showcase layout.
- Added a dense top navigation model: Casinos, Bonuses, Reviews, Compare, Markets, Guides.
- Added prominent market hubs for United Kingdom, Denmark and Ontario (Canada).
- Kept market publication fail-closed: the public data layer still requires approved `casino_market_compliance` rows.

## Admin
- Casino creation/editing is manual-first and compact: essentials first, optional details collapsed.
- Bonus entry is a separate short workflow with casino, title, type, amount, promo code, free spins, minimum deposit, wagering, countries, expiry and terms URL.
- Removed Monitoring from the primary Admin navigation and disabled AI import/auto-update fields in the manual casino form.
- Market Compliance remains a dedicated admin area so market visibility is inspectable independently from the casino master record.

## Public information architecture
Existing routes retained/used include:
- `/`
- `/casinos`
- `/casinos/[slug]`
- `/bonuses`
- `/bonuses/[slug]`
- `/best-online-casinos`
- `/best-casino-bonuses`
- `/no-deposit-casinos`
- `/free-spins-casinos`
- `/crypto-casinos`
- `/compare`
- `/finder`
- `/guides`
- `/guides/[slug]`
- `/markets`
- `/markets/gb/en`
- `/markets/dk/en`
- `/markets/ca/en/ontario`
- `/how-we-review`
- `/how-we-verify`
- `/editorial-policy`
- `/corrections`
- `/about`
- `/contact`

## QA
- `npx tsc --noEmit`: PASS
