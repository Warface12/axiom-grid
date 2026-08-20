# Axiom Grid deployment setup

Before using /admin, configure these Vercel environment variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_EMAIL

Then in Supabase Dashboard > Authentication > Users, create the administrator user with the same email as ADMIN_EMAIL and set its password.

The service-role key is server-side only. Never expose it in a NEXT_PUBLIC_ variable or client code.
