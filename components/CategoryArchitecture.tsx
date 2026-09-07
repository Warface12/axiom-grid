import Link from "next/link";
import { CATALOG } from "@/lib/catalog";

export function CategoryArchitecture() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  return (
    <section className="tp-category-arch" id="categories">
      <div className="ag-section-marker">RESEARCH SURFACE / CATEGORIES</div>
      <h2>The directories are ready. The companies are not invented.</h2>
      <p>Each hub is a real product class TopPick can research later. Empty hubs stay empty until a reviewed record is published.</p>
      {groups.map((group) => (
        <div key={group} className="tp-cat-group">
          <h3>{group}</h3>
          <div className="tp-cat-grid">
            {CATALOG.filter((item) => item.group === group).map((item) => (
              <Link key={item.id} href={`/${item.hub}`} className="tp-cat-card">
                <small>{item.plural.toUpperCase()}</small>
                <b>{item.label}</b>
                <span>{item.summary}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
