import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { ProductFinder } from "@/components/ProductFinder";

export const metadata = buildMetadata({
  title: "Product finder",
  description: "Map a question to exchanges, wallets, brokers, DeFi, ramps and tools.",
  path: "/finder",
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>PRODUCT FINDER</span>
        <h1>Start from the job, not from a brand list</h1>
        <p>Answer a few questions and we route you to the right product class — exchanges, wallets, brokers, DeFi or tools.</p>
      </section>
      <section className="shell content-shell">
        <ProductFinder />
        <p className="tp-continue">
          <Link href="/compare">Compare</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/how-we-rate">How we review</Link>
          <Link href="/markets">Your market</Link>
        </p>
      </section>
    </main>
  );
}
