# Axiom Grid

Independent digital-asset research platform for exchanges, brokers, wallets, fees, security and market access.

## Local run

```bash
npm install
npm run dev
```

## Production check

```bash
npm run typecheck
npm run build
```

## Admin

The public header intentionally has no admin link. `/admin` is protected by Supabase Auth and `ADMIN_EMAIL`. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_EMAIL` in Vercel.

The platform inventory uses the `platform` table and the protected `/api/admin/platforms` API.
