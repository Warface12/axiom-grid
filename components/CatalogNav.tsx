import Link from "next/link";
import { CATALOG } from "@/lib/catalog";

export function CatalogNav() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  return (
    <div className="ag-mega-wrap">
      <Link href="/niches">Niches</Link>
      <div className="ag-mega" role="menu">
        {groups.map((group) => {
          const items = CATALOG.filter((item) => item.group === group);
          return (
            <div key={group}>
              <b>{group}</b>
              {items.slice(0, 5).map((item) => (
                <Link key={item.id} href={`/${item.hub}`}>{item.plural}</Link>
              ))}
              {items.length > 5 ? <Link href="/niches">More in {group}</Link> : null}
            </div>
          );
        })}
        <div>
          <b>Ways in</b>
          <Link href="/niches">All {CATALOG.length} niches</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/start">Start here</Link>
          <Link href="/finder">Finder</Link>
          <Link href="/compare">Compare lab</Link>
          <Link href="/faq">FAQ</Link>
        </div>
      </div>
    </div>
  );
}
