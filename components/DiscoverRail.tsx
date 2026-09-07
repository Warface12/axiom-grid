import Link from "next/link";
import { CATALOG } from "@/lib/catalog";

export function DiscoverRail() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  return (
    <section className="tp-discover" id="categories">
      <div className="tp-section-head">
        <p>ECOSYSTEM</p>
        <h2>Discover by product class</h2>
        <p>Each class has different risks. Start here, then compare inside the class.</p>
      </div>
      <div className="tp-cat-map">
        {groups.map((group) => (
          <div key={group} className="tp-cat-col">
            <b>{group}</b>
            <div className="tp-chip-rail">
              {CATALOG.filter((item) => item.group === group).map((item) => (
                <Link key={item.id} href={`/${item.hub}`}>{item.plural}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
