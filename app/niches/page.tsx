import Link from "next/link";
import { buildMetadata, webPageJsonLd, itemListJsonLd } from "@/lib/seo";
import { CATALOG } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { CategoryMark } from "@/components/visual/CategoryMark";

export const metadata = buildMetadata({
  title: "Crypto product niches — TopPick.pro",
  description: "Every product class TopPick researches: exchanges, wallets, brokers, DEX, DeFi, futures, bridges, custody and more. Empty classes stay empty.",
  path: "/niches",
  keywords: CATALOG.map((item) => item.plural.toLowerCase()),
});

export default function Page() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  const schema = webPageJsonLd({
    name: "TopPick product niches",
    description: "Index of researched crypto and trading product classes.",
    path: "/niches",
  });
  const list = itemListJsonLd(CATALOG.map((item) => ({ name: item.plural, url: `${SITE_URL}/${item.hub}` })));
  return (
    <main className="tp-niche-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <section className="shell page-hero">
        <span>Product niches</span>
        <h1>Every class has its own job and its own failure mode.</h1>
        <p>{CATALOG.length} researched niches — exchanges, wallets, futures, bridges, lending, restaking and more. Empty classes stay empty instead of filling with invented brands.</p>
      </section>
      {groups.map((group) => (
        <section key={group} aria-label={group}>
          <div className="shell" style={{ marginBottom: 8 }}>
            <p className="tp-kicker">{group}</p>
          </div>
          <div className="tp-niche-grid">
            {CATALOG.filter((item) => item.group === group).map((item) => (
              <Link key={item.id} href={`/${item.hub}`} className="tp-niche-card">
                <CategoryMark id={item.id} />
                <span>
                  <b>{item.plural}</b>
                  <em>{item.summary}</em>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <p className="tp-chapter-links shell">
        <Link href="/finder">Guided finder</Link>
        <Link href="/compare">Compare lab</Link>
        <Link href="/research">Research desk</Link>
        <Link href="/markets">Markets</Link>
      </p>
    </main>
  );
}
