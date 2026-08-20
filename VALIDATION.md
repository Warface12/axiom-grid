# Validation

- TypeScript: `npx tsc --noEmit` — PASS after radical public/admin redesign on 2026-08-20.
- Production build was not executed in the Linux packaging environment because the supplied dependency bundle contains Windows Next.js SWC binaries. Vercel/fresh npm install resolves the platform-specific binary automatically.
