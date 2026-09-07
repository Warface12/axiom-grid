import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { CATALOG } from "@/lib/catalog";
import { ProductFinder } from "@/components/ProductFinder";

export const metadata = buildMetadata({
  title: "Product finder",
  description: "Map a research question to exchanges, wallets, brokers, DeFi, ramps and tools. Empty directories stay empty until real partners are published.",
  path: "/finder",
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>PRODUCT FINDER</span>
        <h1>Start from the job, not from a brand list</h1>
        <p>This helper routes you to the right category. It does not rank companies, invent fees, or fill empty directories with sample partners.</p>
      </section>
      <section className="shell content-shell">
        <ProductFinder />
        <div className="tp-tool-grid" style={{ marginTop: 24 }}>
          <Link href="/compare" className="tp-tool-card"><small>COMPARE</small><b>Side-by-side research</b><p>Category-aware fields. Missing values stay unpublished.</p></Link>
          <Link href="/glossary" className="tp-tool-card"><small>GLOSSARY</small><b>Shared language</b><p>Custody, KYC, DEX, fees and ramps, explained plainly.</p></Link>
          <Link href="/how-we-rate" className="tp-tool-card"><small>METHOD</small><b>How we review</b><p>Evidence first. Scores wait for sourced facts.</p></Link>
          <Link href="/markets" className="tp-tool-card"><small>GEO</small><b>Market explorer</b><p>Research visibility and affiliate promotion are separate switches.</p></Link>
        </div>
        <p className="tp-muted" style={{ marginTop: 24 }}>Taxonomy: {CATALOG.map((c) => c.plural).join(" · ")}.</p>
      </section>
    </main>
  );
}
