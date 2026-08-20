# Axiom Grid clean rebuild audit

- Removed the nested/embedded Git repository layout from the deliverable.
- Removed Nivaro/NivaroBet documentation, casino routes, casino components, casino APIs and Nivaro Core files.
- Rebuilt Axiom Grid metadata, footer, market page, compare/search/learn pages and legal pages around digital-asset research only.
- Rebuilt the admin overview for platform inventory, editorial research, markets, monitoring and SEO.
- Public header contains no admin/control-room link.
- Admin panel is protected by Supabase Auth + ADMIN_EMAIL.
- Admin platform API now checks the authenticated admin session for GET/POST/DELETE.
- Platform add/edit/delete remains wired to the `platform` Supabase table.
- Replaced the database schema with an Axiom-specific platform schema.
- `node node_modules/typescript/bin/tsc --noEmit` passes with zero TypeScript errors.
- Full Next.js build could not be executed in the Linux packaging environment because the uploaded Windows node_modules does not include the Linux SWC binary. Run `npm install` and `npm run build` on Windows before deployment.
