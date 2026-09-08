import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { CategoryMark } from "@/components/visual/CategoryMark";

export function ProductUniverse() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  return (
    <section className="tp-chapter tp-chapter--universe" id="universe">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Live product universe</p>
          <h2>A map of classes, not a wall of the same card.</h2>
          <p className="tp-lead">Each family has a different job and a different failure mode. Open a class, then compare inside it.</p>
        </header>
        <div className="tp-universe">
          {groups.map((group) => (
            <article key={group} className="tp-universe-col">
              <h3>{group}</h3>
              <ul>
                {CATALOG.filter((item) => item.group === group).map((item) => (
                  <li key={item.id}>
                    <Link href={`/${item.hub}`} className={`tp-universe-tile is-${item.id}`}>
                      <CategoryMark id={item.id} />
                      <span>
                        <b>{item.plural}</b>
                        <em>{item.summary}</em>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
