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
    <main className="shell content-shell">
      <section className="page-hero">
        <span>COMPARE</span>
        <h1>Compare like with like.</h1>
        <p>The comparison engine is ready. It only lists reviewed public profiles and leaves undisclosed fields empty. It will not invent fees, ratings or availability.</p>
      </section>
      {platforms.length ? (
        <CompareClient platforms={platforms} initialIds={initialIds} />
      ) : (
        <div className="ag-empty-directory">
          <div className="empty-index">
            <span>COMPARISON ENGINE</span>
            <h2>Nothing to compare yet.</h2>
            <p>When real platforms are published, you can compare two to four profiles inside the same product class. Until then, use the field map below — it is the comparison engine, not a table of invented brands.</p>
            <div className="empty-actions">
              {CATALOG.filter((c) => c.dedicated).map((c) => (
                <Link key={c.id} href={`/${c.hub}`}>{c.plural}</Link>
              ))}
              <Link href="/learn">Guides</Link>
            </div>
            <div className="tp-tool-grid" style={{ marginTop: 24 }}>
              {CATALOG.slice(0, 6).map((c) => (
                <article key={c.id} className="tp-tool-card">
                  <small>{c.plural}</small>
                  <b>{c.label}</b>
                  <p>Compared on: {c.compareKeys.join(", ")}.</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
