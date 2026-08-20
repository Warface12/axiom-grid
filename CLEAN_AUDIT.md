# Axiom Grid clean audit

- Removed unrelated legacy project files and routes.
- Public branding is Axiom Grid only.
- Public navigation contains no admin/control-room link.
- Admin routes are protected by Supabase Auth plus an ADMIN_EMAIL allow-list.
- Partner inventory API requires an authenticated admin and a server-side service role key.
- TypeScript validation passes with `tsc --noEmit`.
