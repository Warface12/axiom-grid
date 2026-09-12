import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Risk disclosure — TopPick.pro",
  description: "Trading and digital-asset risk disclosure for TopPick research users.",
  path: "/legal/risk-disclosure",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Legal</span>
        <h1>Risk disclosure</h1>
        <p>Cryptoassets and leveraged trading can result in the loss of some or all of your capital. Past performance is not a reliable indicator of future results.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>Not advice</b><p>TopPick does not provide personal investment, tax or legal advice. Product availability and client-money protections vary by country and legal entity.</p></article>
        <article className="tp-start-card"><b>Offers and points</b><p>Promotional offers may include conditions, expiry dates, KYC and restricted markets. Loyalty points are not cash unless a sourced record says otherwise.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/affiliate-disclosure">Affiliate disclosure</Link>
        <Link href="/faq">FAQ</Link>
      </p>
    </main>
  );
}
