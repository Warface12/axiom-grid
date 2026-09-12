import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { CategoryMark } from "@/components/visual/CategoryMark";

export function ProductUniverse() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  return (
    <section className="tp-chapter tp-chapter--universe" id="universe">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Product universe</p>
          <h2>Families first. Then the class.</h2>
          <p className="tp-lead">{CATALOG.length} researched niches, grouped by the job they actually do. Open a family, or see every class on the niche map.</p>
        </header>
        <div className="tp-universe">
          {groups.map((group) => {
            const items = CATALOG.filter((item) => item.group === group);
            const lead = items[0];
            return (
              <article key={group} className="tp-universe-col">
                <Link href="/niches" className={`tp-universe-tile is-${lead.id}`}>
                  <CategoryMark id={lead.id} />
                  <span>
                    <b>{group}</b>
                    <em>{items.map((item) => item.plural).join(" · ")}</em>
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
        <p className="tp-chapter-links">
          <Link href="/niches">Open every niche</Link>
          <Link href="/jobs">Browse by job</Link>
          <Link href="/finder">Guided finder</Link>
        </p>
      </div>
    </section>
  );
}
