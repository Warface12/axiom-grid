import { PlatformIndex } from "@/components/PlatformIndex";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";
import { getPublicPlatforms, getSitemapPlatforms } from "@/lib/platforms";
import type { CatalogKind } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { platformPath } from "@/lib/catalog";

export async function productHubMetadata(cat: CatalogKind) {
  const published = (await getSitemapPlatforms()).filter((item) => item.kind === cat.id);
  return buildMetadata({
    title: `${cat.plural} research — TopPick.pro`,
    description: cat.summary,
    path: `/${cat.hub}`,
    noIndex: published.length === 0,
  });
}

export async function ProductHub({ cat }: { cat: CatalogKind }) {
  const items = await getPublicPlatforms(cat.id);
  const list = items.length ? itemListJsonLd(items.map((item) => ({ name: item.name, url: `${SITE_URL}${platformPath(item.kind, item.slug)}` }))) : null;
  return (
    <main className={`tp-hub tp-hub--${cat.hub}`}>
      {list ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} /> : null}
      <section className="shell tp-hub-hero">
        <div>
          <p>{cat.group}</p>
          <h1>{cat.plural}</h1>
          <p>{cat.summary}</p>
        </div>
        <svg className="tp-hub-mark" viewBox="0 0 280 180" aria-hidden="true">
          <defs>
            <radialGradient id={`hubGlow-${cat.hub}`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#37d9ff" stopOpacity="0.4" />
              <stop offset="1" stopColor="#37d9ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="140" cy="90" rx="88" ry="36" fill={`url(#hubGlow-${cat.hub})`} />
          <ellipse cx="140" cy="90" rx="70" ry="28" fill="none" stroke="#37d9ff" strokeOpacity="0.35" />
          <circle cx="140" cy="90" r="7" fill="#37d9ff" />
          <circle cx="70" cy="70" r="3.5" fill="#c8ecff" />
          <circle cx="210" cy="78" r="3" fill="#37d9ff" />
          <circle cx="188" cy="124" r="2.5" fill="#c8ecff" />
          <path d="M140 90 L70 70 M140 90 L210 78 M140 90 L188 124" stroke="#37d9ff" strokeOpacity="0.35" fill="none" />
        </svg>
      </section>
      <section className="shell content-shell">
        <PlatformIndex kind={cat.id} items={items} />
      </section>
    </main>
  );
}
