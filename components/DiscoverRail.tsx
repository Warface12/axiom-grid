import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { CategoryMark } from "@/components/visual/CategoryMark";

const FEATURED = ["exchange", "wallet", "broker", "futures", "dex", "lending", "otc", "onramp", "staking", "etf", "bots", "custody"];

export function DiscoverRail() {
  const featured = CATALOG.filter((item) => FEATURED.includes(item.id));
  return (
    <section className="tp-chapter tp-chapter--rail" id="categories">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Featured classes</p>
          <h2>Pick a family. Then go deep.</h2>
          <p className="tp-lead">Twelve doors people actually use. The rest of the catalog lives on the niche map — empty classes stay empty.</p>
        </header>
        <div className="tp-sig-rail" role="list">
          {featured.map((item) => (
            <Link key={item.id} href={`/${item.hub}`} className={`tp-sig-card is-${item.id}`} role="listitem">
              <CategoryMark id={item.id} />
              <small>{item.group}</small>
              <b>{item.plural}</b>
              <span>{item.summary}</span>
            </Link>
          ))}
        </div>
        <p className="tp-chapter-links">
          <Link href="/niches">All {CATALOG.length} niches</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/finder">Finder</Link>
        </p>
      </div>
    </section>
  );
}
