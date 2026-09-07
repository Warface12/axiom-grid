import Link from "next/link";
import { PlatformIndex } from "@/components/PlatformIndex";
import { buildMetadata } from "@/lib/seo";
import { getPublicPlatforms, getSitemapPlatforms } from "@/lib/platforms";
import type { CatalogKind } from "@/lib/catalog";

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
  return (
    <main>
      <section className="shell page-hero">
        <span>PLATFORM HUB / {cat.plural.toUpperCase()}</span>
        <h1>{cat.plural}</h1>
        <p>{cat.summary} Profiles stay hidden until an editor publishes a reviewed record. Empty directories are intentional — TopPick does not invent companies to fill a grid.</p>
      </section>
      <section className="shell content-shell">
        <PlatformIndex kind={cat.id} items={items} />
        <p className="tp-hub-note"><Link href="/how-we-rate">How records are reviewed</Link> · <Link href="/compare">Comparison engine</Link> · <Link href="/markets">Market eligibility</Link></p>
      </section>
    </main>
  );
}
