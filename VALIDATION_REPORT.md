# Validation report — 2026-08-22

- TypeScript validation: **PASS** (`npm run typecheck`) after the market-visibility, partner-post and claim-safety additions.
- Production `next build`: could not complete in this Linux packaging environment because the available dependency cache does not contain the Linux Next.js SWC binary. The source reached the Next build command; this is an environment/dependency-binary limitation.
- GitHub Actions CI remains included and will run dependency install, typecheck and production build on Ubuntu after push.
- Country/region platform visibility is fail-closed: missing, expired, restricted or unapproved availability records hide the platform.
- Region/province-specific rows override country-level fallback rows.
- Commercial partner routing is separately fail-closed and requires `commercial_allowed = true`.
- Partner editorial posts require a linked platform, factual title/body and source URL; common guarantee/risk-free/absolute-ranking/profit-promise wording is blocked by the admin API.
- Published partner updates inherit market visibility and can also be narrowed to explicit country codes.
- No `node_modules`, `.next`, local secrets or generated dependency directories are included in the GitHub package.
