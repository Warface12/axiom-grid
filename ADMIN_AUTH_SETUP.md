# TopPick admin authentication

Current login is **environment-based**, not an embedded password verifier.

Required Vercel/env vars:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Optional fallback: a Supabase Auth user whose email matches `ADMIN_EMAIL`.

Cookie: `toppick_admin` (HttpOnly, SameSite=Lax, Secure in production, 12 hours).

Do not commit passwords or session secrets. If this repository is public, rotate `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` immediately.
