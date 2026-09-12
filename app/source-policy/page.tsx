import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Source policy",
  description: "How TopPick records public sources, treats imported metadata, and refuses to guess missing product facts.",
  path: "/source-policy",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Evidence</span>
        <h1>If we cannot point to a source, the field stays empty.</h1>
        <p>Every important claim on a platform page should be traceable. Imported metadata is not a verified fact.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>What counts</b><p>Operator websites, legal documents, published fee schedules, official help centres and regulator registers. Marketing slogans are not verified facts.</p></article>
        <article className="tp-start-card"><b>Imported is not verified</b><p>URL import may collect a title or icon. That draft still needs a human review. Fees, licenses and GEO are never guessed.</p></article>
        <article className="tp-start-card"><b>What we will not do</b><p>We do not bypass logins, CAPTCHAs, paywalls or private networks. Internal IPs are blocked in the importer.</p></article>
        <article className="tp-start-card"><b>Freshness</b><p>Stale does not mean false — it means it needs another look before you treat it as current.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/editorial-policy">Editorial policy</Link>
        <Link href="/how-we-rate">How we rate</Link>
        <Link href="/corrections">Corrections</Link>
      </p>
    </main>
  );
}
