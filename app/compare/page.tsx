import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getPublicPlatforms } from "@/lib/platforms";
import { CompareClient } from "@/components/CompareClient";
import { CATALOG } from "@/lib/catalog";

export const metadata = buildMetadata({
  title: "Compare Platforms — TopPick.pro",
  description: "Category-aware comparison for exchanges, wallets, brokers, DEXs and other crypto products using only published fields.",
  path: "/compare",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const params = await searchParams;
  const platforms = await getPublicPlatforms(undefined, 48);
  const initialIds = (params.ids || "").split(",").map((v) => v.trim()).filter(Boolean);
  return (
    <main className="shell content-shell tp-compare-page">
      <section className="page-hero">
        <span>COMPARE LAB</span>
        <h1>Compare like with like.</h1>
        <p>Compare reviewed public profiles in the same product class. Undisclosed fields stay empty. Fees, ratings and availability are never invented.</p>
      </section>
      {platforms.length ? (
        <CompareClient platforms={platforms} initialIds={initialIds} />
      ) : (
        <div className="tp-empty-guide">
          <h2>How comparison works</h2>
          <p>Two to four products in the same class. Missing facts stay blank. Nothing is invented to fill a table.</p>
          <ul>
            <li>Exchange versus exchange — not versus a wallet</li>
            <li>Fees and custody only when the source exists</li>
            <li>Your country can change what you can actually use</li>
          </ul>
          <div className="tp-continue">
            {CATALOG.filter((c) => c.dedicated).slice(0, 6).map((c) => (
              <Link key={c.id} href={`/${c.hub}`}>{c.plural}</Link>
            ))}
            <Link href="/finder">Finder</Link>
            <Link href="/learn">Guides</Link>
          </div>
        </div>
      )}
    </main>
  );
}
