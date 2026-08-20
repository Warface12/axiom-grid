# Axiom Grid Admin Authentication — Embedded Account Patch

This patch protects `/admin` and all admin sub-routes behind `/admin/login`.

The administrator email and a one-way password verifier are embedded server-side, so no Vercel environment variables are required for login.

Security notes:
- The plaintext password is NOT stored in source; only a SHA-256 verifier is present.
- A server-side session signing secret is embedded in this patch for convenience.
- Keep the GitHub repository PRIVATE. If this code is ever exposed publicly, rotate the admin password and session secret immediately.
- Session cookie is HttpOnly, SameSite=Lax, Secure in production, and expires after 12 hours.

Protected routes:
- `/admin`
- `/admin/platforms`
- `/admin/content`
- `/admin/markets`
- `/admin/seo`
- `/admin/monitoring`

Public login route:
- `/admin/login`
