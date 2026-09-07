import Link from "next/link";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata = buildMetadata({
  title: `About ${SITE_NAME}`,
  description: "What TopPick.pro is, how research is produced, and how commercial relationships are separated from editorial records.",
  path: "/about",
});

export default function Page() {
  const schema = webPageJsonLd({
    name: `About ${SITE_NAME}`,
    description: "Independent crypto and trading comparison research publisher.",
    path: "/about",
  });
  return (
    <main className="shell content-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="page-hero">
        <span>ABOUT</span>
        <h1>A research publisher, not a venue.</h1>
        <p>TopPick.pro compares exchanges, wallets, brokers and related crypto products. It is not an exchange, broker, wallet issuer or financial adviser.</p>
      </section>
      <article className="prose-card">
        <h2>What we publish</h2>
        <p>Platform records, methodology pages, sourced updates and market-eligibility notes. Facts that are not evidenced stay empty or marked for review.</p>
        <h2>What we do not invent</h2>
        <p>Fees, licenses, user counts, live prices, affiliate offers and testimonials are never fabricated to fill a layout.</p>
        <h2>Commercial relationships</h2>
        <p>When a partner link exists, it is stored explicitly and routed only after a market rule allows promotion. Compensation is disclosed and is not a ranking.</p>
        <p><Link href="/editorial-policy">Editorial policy</Link> · <Link href="/how-we-rate">How we rate</Link> · <Link href="/contact">Contact</Link></p>
      </article>
    </main>
  );
}
