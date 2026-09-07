# TopPick admin authentication

Admin access is a dedicated server session. It is not granted because a Supabase user email matches `ADMIN_EMAIL`.

Required environment variables (server-only — never `NEXT_PUBLIC_*`):

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Cookie: `toppick_admin` (HttpOnly, SameSite=Lax, Secure in production, 12 hours).

Do not use these credentials as consumer test logins, form placeholders, or client defaults.

If this repository is public or a privileged secret was ever shipped in a client bundle, rotate the affected secret class immediately. Do not commit passwords or session secrets.
