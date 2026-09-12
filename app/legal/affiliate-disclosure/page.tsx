import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Affiliate Disclosure",
  description: "How TopPick.pro uses partner links and keeps commercial relationships separate from editorial research.",
  path: "/legal/affiliate-disclosure",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Legal</span>
        <h1>Affiliate disclosure</h1>
        <p>Some outbound links may be affiliate links. If you complete a qualifying action, TopPick may receive compensation at no additional direct cost to you.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>Editorial separation</b><p>Compensation does not guarantee a positive assessment or public visibility. Commercial relationships do not prove a product is available in your country.</p></article>
        <article className="tp-start-card"><b>Advertising</b><p>Companies may pay for disclosed placements with no affiliate relationship. Sponsored visibility is labeled and does not rewrite research.</p></article>
        <article className="tp-start-card"><b>No financial advice</b><p>This is general comparison material. Digital assets can involve substantial loss of capital.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/legal/risk-disclosure">Risks</Link>
        <Link href="/partners">Partners</Link>
        <Link href="/how-we-rate">How we rate</Link>
      </p>
    </main>
  );
}
