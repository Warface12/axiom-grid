import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { MethodologyTrack } from "@/components/MethodologyTrack";

export const metadata = buildMetadata({
  title: "How We Rate Crypto Platforms",
  description: "Our evidence-first review methodology for crypto exchanges, online brokers and wallets, including fees, security, product access, transparency and market fit.",
  path: "/how-we-rate",
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>EDITORIAL METHODOLOGY</span>
        <h1>How we rate platforms</h1>
        <p>A transparent methodology is part of the product, not a footnote. The exact weights can evolve, but the evidence behind a score must remain auditable.</p>
      </section>
      <MethodologyTrack />
      <section className="shell content-shell simple-grid">
        <article className="prose-card"><h3>Security & custody</h3><p>Account protections, custody model, wallet architecture where relevant, security disclosures and documented incidents.</p></article>
        <article className="prose-card"><h3>Fees & execution</h3><p>Trading fees, spreads, deposits, withdrawals and other material costs, with source and freshness dates.</p></article>
        <article className="prose-card"><h3>Product access</h3><p>Supported assets or instruments, order types, platforms, funding and advanced features relevant to the product type.</p></article>
        <article className="prose-card"><h3>Transparency</h3><p>Legal entity, official disclosures, support, pricing clarity and the amount of verifiable product information available.</p></article>
        <article className="prose-card"><h3>Usability</h3><p>Onboarding, navigation, mobile/desktop experience and suitability for different experience levels.</p></article>
        <article className="prose-card"><h3>Market fit</h3><p>Jurisdiction-specific availability, restrictions and the separate question of whether affiliate promotion is permitted.</p></article>
      </section>
      <p className="tp-chapter-links shell">
        <Link href="/methodology">Desk rules</Link>
        <Link href="/editorial-policy">Editorial policy</Link>
        <Link href="/source-policy">Source policy</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/research">Research desk</Link>
      </p>
    </main>
  );
}
