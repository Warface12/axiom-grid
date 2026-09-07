import Link from "next/link";
import { CATALOG } from "@/lib/catalog";

export function CatalogNav() {
  const groups = Array.from(new Set(CATALOG.map((item) => item.group)));
  return (
    <div className="ag-mega-wrap">
      <Link href="/#categories">Explore</Link>
      <div className="ag-mega" role="menu">
        {groups.map((group) => (
          <div key={group}>
            <b>{group}</b>
            {CATALOG.filter((item) => item.group === group).map((item) => (
              <Link key={item.id} href={`/${item.hub}`}>{item.plural}</Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
