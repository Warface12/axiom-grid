import Link from "next/link";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { getPublicPlatforms } from "@/lib/platforms";
import { CompareClient } from "@/components/CompareClient";
import { CATALOG } from "@/lib/catalog";

export const metadata = buildMetadata({
  title: "Compare crypto products — TopPick.pro",
  description: "Category-aware comparison for exchanges, wallets, brokers, DEXs, futures, bridges and other niches using only published fields.",
  path: "/compare",
  keywords: ["compare crypto exchanges", "wallet comparison", "broker vs exchange", "compare futures"],
});

export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const params = await searchParams;
  const platforms = await getPublicPlatforms(undefined, 48);
  const initialIds = (params.ids || "").split(",").map((v) => v.trim()).filter(Boolean);
  const faq = faqJsonLd([
    { question: "Can I compare an exchange to a wallet?", answer: "No. TopPick compares like with like. Mix two classes and the table only shows the shared fields." },
    { question: "Why are some cells empty?", answer: "Missing fees, licenses or yields stay empty. Nothing is invented to fill a table." },
  ]);
  return (
    <main className="tp-compare-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <section className="shell page-hero">
        <span>Compare lab</span>
        <h1>Compare like with like.</h1>
        <p>Reviewed public profiles only. Undisclosed fields stay empty. Fees, ratings and availability are never invented.</p>
      </section>
      <section className="shell">
        {platforms.length ? (
          <CompareClient platforms={platforms} initialIds={initialIds} />
        ) : (
          <div className="tp-empty-guide">
            <h2>How comparison works</h2>
            <p>Two to four products in the same class. Missing facts stay blank.</p>
            <ul>
              <li>Exchange versus exchange — not versus a wallet</li>
              <li>Fees and custody only when the source exists</li>
              <li>Your country can change what you can actually use</li>
            </ul>
          </div>
        )}
      </section>
      <section className="shell content-shell">
        <h2>Open a class first</h2>
        <div className="tp-jobs-grid">
          {Array.from(new Set(CATALOG.map((c) => c.group))).map((group) => {
            const items = CATALOG.filter((c) => c.group === group);
            return (
              <Link key={group} href="/niches" className="tp-job-card">
                <b>{group}</b>
                <p>{items.map((item) => item.plural).join(" · ")}</p>
              </Link>
            );
          })}
        </div>
        <p className="tp-chapter-links">
          <Link href="/niches">All {CATALOG.length} niches</Link>
          <Link href="/finder">Finder</Link>
        </p>
      </section>
    </main>
  );
}
