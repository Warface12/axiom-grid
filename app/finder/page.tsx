import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { ProductFinder } from "@/components/ProductFinder";

export const metadata = buildMetadata({
  title: "Product finder — TopPick.pro",
  description: "Map a job to exchanges, wallets, brokers, futures, lending, bridges and other niches. Four questions. No invented ranking.",
  path: "/finder",
  keywords: ["crypto product finder", "choose a crypto exchange", "wallet finder"],
});

export default function Page() {
  return (
    <main className="tp-finder-page">
      <section className="shell page-hero">
        <span>Product finder</span>
        <h1>A guided path, not a form dump.</h1>
        <p>Answer four questions. We route you to the matching product class — exchanges, wallets, brokers, DeFi or tools. No ranked company list is invented.</p>
      </section>
      <section className="shell content-shell">
        <ProductFinder />
        <p className="tp-continue">
          <Link href="/jobs">Jobs</Link>
          <Link href="/niches">Niches</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/markets">Your market</Link>
        </p>
      </section>
    </main>
  );
}
