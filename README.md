# NIVARO

Production-oriented foundation for a premium Casino + Bonuses + Live Sports discovery platform.

## Run locally

1. Install Node.js 20+.
2. Run:
   npm install
   npm run dev
3. Open http://localhost:3000

## Supabase

Copy `.env.example` to `.env.local` and add your Supabase project URL and anon key.

Run `supabase/schema.sql` in Supabase SQL Editor.

## Production security

The Admin page is a UI foundation. Before public launch, connect it to Supabase Auth and enforce authorization server-side/RLS. Never put a Supabase service-role key in client-side code.

## External integrations

- Casino/affiliate feeds: connect only official partner APIs/data feeds.
- Sports: connect a licensed/authorized sports data provider.
- Payment/commission reporting: use partner-provided reporting or secure server-side imports.

Do not publish placeholder/demo live-score data as real data.
