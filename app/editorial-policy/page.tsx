import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Editorial policy — TopPick.pro",
  description: "How TopPick separates research, partner compensation and unpublished facts.",
  path: "/editorial-policy",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Editorial</span>
        <h1>Research stays independent of the invoice.</h1>
        <p>TopPick publishes comparison research. It is not an exchange, broker, wallet issuer or financial adviser.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card">
          <b>What we will not invent</b>
          <p>Fees, licenses, ratings, availability and affiliate destinations stay empty until a sourced record exists. Empty is a valid public state.</p>
        </article>
        <article className="tp-start-card">
          <b>Partner relationships</b>
          <p>Advertising, affiliate and tracking are independent. A company may advertise with no affiliate contract. Compensation is not a ranking.</p>
        </article>
        <article className="tp-start-card">
          <b>Corrections</b>
          <p>If a published fact is wrong, we correct the record rather than quietly overwriting history.</p>
        </article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/how-we-rate">How we rate</Link>
        <Link href="/source-policy">Source policy</Link>
        <Link href="/corrections">Corrections</Link>
        <Link href="/legal/affiliate-disclosure">Affiliate disclosure</Link>
      </p>
    </main>
  );
}
