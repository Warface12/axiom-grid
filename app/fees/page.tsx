import { buildMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Crypto fees explained — TopPick.pro",
  description: "How to compare maker/taker fees, spreads, funding and withdrawals without invented numbers.",
  path: "/fees",
  keywords: ["crypto fees", "maker taker", "withdrawal fees", "funding rate"],
});

const QA = [
  { question: "Is a zero-fee claim complete?", answer: "No. Spread, conversion, funding and withdrawal costs can dominate. If the operator does not publish those, TopPick leaves the field empty." },
  { question: "Do you estimate missing fee tables?", answer: "No. A missing schedule is unpublished evidence, not a zero and not a guess." },
];

export default function Page() {
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Topics", url: `${SITE_URL}/topics` },
    { name: "Fees", url: `${SITE_URL}/fees` },
  ]);
  return (
    <main className="tp-start-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(QA)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="shell page-hero">
        <span>Fees</span>
        <h1>The fee you see is rarely the whole cost.</h1>
        <p>Maker/taker tables are a starting point. Spread, conversion, funding, withdrawal and inactivity charges can dominate smaller accounts.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>Spot vs derivatives</b><p>Funding and overnight costs only apply where the product uses them.</p></article>
        <article className="tp-start-card"><b>Fiat ramps</b><p>Deposit and payout fees can exceed trading fees.</p></article>
        <article className="tp-start-card"><b>Network withdrawals</b><p>On-chain fees vary and are not controlled by comparison publishers.</p></article>
        <article className="tp-start-card"><b>Account tiers</b><p>Volume discounts are operator-specific. Do not assume a public VIP schedule applies to you.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/learn/crypto-fees-explained">Read the full guide</Link>
        <Link href="/exchanges">Exchange directory</Link>
        <Link href="/tax">Tax tools</Link>
        <Link href="/compare">Compare lab</Link>
      </p>
    </main>
  );
}
