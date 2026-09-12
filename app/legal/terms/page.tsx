import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Use — TopPick.pro",
  description: "Terms governing use of TopPick.pro comparison research, partner links and market-availability information.",
  path: "/legal/terms",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Legal</span>
        <h1>Terms of use</h1>
        <p>TopPick.pro provides general research, comparison material and links to third-party providers. The site is not a broker, exchange, wallet provider, investment adviser, law firm or tax adviser.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>Information can change</b><p>Fees, product features, legal entities and partner terms can change without notice. Verify important details with the provider before opening or funding an account.</p></article>
        <article className="tp-start-card"><b>Risk</b><p>Trading, leveraged products and digital assets can involve substantial risk and may result in loss of some or all capital. Users are responsible for assessing suitability and local permission.</p></article>
        <article className="tp-start-card"><b>Third-party and affiliate links</b><p>Some links may be affiliate links. A commercial relationship does not guarantee a favorable review or eligibility in every market.</p></article>
        <article className="tp-start-card"><b>Market availability</b><p>Where eligibility is unknown or restricted, TopPick keeps promotional visibility off rather than assuming access is permitted. This is not legal advice.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/legal/risk-disclosure">Risks</Link>
        <Link href="/legal/affiliate-disclosure">Affiliate disclosure</Link>
        <Link href="/legal/privacy">Privacy</Link>
      </p>
    </main>
  );
}
