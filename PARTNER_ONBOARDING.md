# Partner onboarding — operational checklist

A new partner should be addable without changing application code.

1. Add the platform in Admin → Inventory. Keep **Publicly visible** off while research is incomplete.
2. Record the official website, legal/product context, fees, security/custody summary and primary-source evidence.
3. Add market rules in Admin → Markets. Product availability and commercial promotion are separate toggles.
4. Only set a market row to `approved` and `commercial_allowed=true` when current evidence supports both provider availability and TopPick's promotion permission.
5. Add a review/recheck date. Expired approvals are returned to review by monitoring.
6. Publish the research profile when factual review is ready. A public research profile does not require a promotional CTA.
7. Confirm the public profile metadata, canonical, schema and sitemap entry after deployment.
8. Test the `/go/<platform-id>` commercial route from an approved and an unapproved market before launch.

Never place passwords, Supabase service-role keys, Search Console private keys or affiliate account credentials in client-side files or GitHub commits.
