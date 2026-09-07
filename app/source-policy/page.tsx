import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Source policy",
  description: "How TopPick records public sources, treats imported metadata, and refuses to guess missing product facts.",
  path: "/source-policy",
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>EVIDENCE</span>
        <h1>Source policy</h1>
        <p>Every important claim on a platform page should be traceable. If we cannot point to a public source, the field stays empty or marked for review.</p>
      </section>
      <section className="shell content-shell simple-grid">
        <article className="prose-card"><h3>What counts as a source</h3><p>Operator websites, legal documents, published fee schedules, official help centres and regulator registers. Marketing slogans are not treated as verified product facts.</p></article>
        <article className="prose-card"><h3>Imported is not verified</h3><p>URL import may collect a title, description or icon from public HTML. That draft still needs a human review. We never auto-publish or fill fees, licenses or GEO from guesses.</p></article>
        <article className="prose-card"><h3>What we will not do</h3><p>We do not bypass logins, CAPTCHAs, paywalls or private networks. We do not scrape behind authentication. Internal IPs are blocked in the importer.</p></article>
        <article className="prose-card"><h3>Freshness</h3><p>When a fact is time-sensitive, last-checked and last-verified dates are stored. Stale does not mean false — it means it needs another look before you treat it as current.</p></article>
      </section>
    </main>
  );
}
