import Link from "next/link";
import { CATALOG } from "@/lib/catalog";

export function DiscoverRail() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  return (
    <section className="tp-discover" id="categories">
      <div className="tp-section-head">
        <p>ECOSYSTEM</p>
        <h2>The product map</h2>
        <p>Each class has different risks. Open a class, then compare inside it.</p>
      </div>
      <div className="tp-eco-grid">
        {groups.map((group) => (
          <article key={group} className="tp-eco-col">
            <h3>{group}</h3>
            <ul>
              {CATALOG.filter((item) => item.group === group).map((item) => (
                <li key={item.id}>
                  <Link href={`/${item.hub}`}>
                    <b>{item.plural}</b>
                    <span>{item.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
