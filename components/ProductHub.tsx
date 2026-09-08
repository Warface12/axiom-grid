import { PlatformIndex } from "@/components/PlatformIndex";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";
import { getPublicPlatforms } from "@/lib/platforms";
import type { CatalogKind } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { platformPath } from "@/lib/catalog";
import { CategoryMark } from "@/components/visual/CategoryMark";
import Link from "next/link";

export async function productHubMetadata(cat: CatalogKind) {
  return buildMetadata({
    title: `${cat.plural} research — TopPick.pro`,
    description: cat.summary,
    path: `/${cat.hub}`,
  });
}

export async function ProductHub({ cat }: { cat: CatalogKind }) {
  const items = await getPublicPlatforms(cat.id);
  const list = items.length ? itemListJsonLd(items.map((item) => ({ name: item.name, url: `${SITE_URL}${platformPath(item.kind, item.slug)}` }))) : null;
  return (
    <main className={`tp-hub tp-hub--${cat.hub} tp-hub--${cat.group.toLowerCase().replace(/\s+/g, "-")}`}>
      {list ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} /> : null}
      <section className="shell tp-hub-hero">
        <div>
          <p>{cat.group}</p>
          <h1>{cat.plural}</h1>
          <p>{cat.summary}</p>
          <p className="tp-chapter-links">
            <Link href="/compare">Compare in this class</Link>
            <Link href="/finder">Finder</Link>
            <Link href="/research">Research desk</Link>
          </p>
        </div>
        <CategoryMark id={cat.id} className="tp-hub-object" />
      </section>
      <section className="shell content-shell">
        <PlatformIndex kind={cat.id} items={items} />
      </section>
    </main>
  );
}
