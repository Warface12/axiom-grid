import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { CategoryMark } from "@/components/visual/CategoryMark";

export function DiscoverRail() {
  return (
    <section className="tp-chapter tp-chapter--rail" id="categories">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Product categories</p>
          <h2>Pick a family. Then go deep.</h2>
          <p className="tp-lead">Swipe the rail on a phone. On a desk, scan the signatures. No two classes share the same object.</p>
        </header>
        <div className="tp-sig-rail" role="list">
          {CATALOG.map((item) => (
            <Link key={item.id} href={`/${item.hub}`} className={`tp-sig-card is-${item.id}`} role="listitem">
              <CategoryMark id={item.id} />
              <small>{item.group}</small>
              <b>{item.plural}</b>
              <span>{item.summary}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
