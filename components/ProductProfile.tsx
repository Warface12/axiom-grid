import { safePlatformSeoTitle } from "@/lib/contentSafety";
import { notFound } from "next/navigation";
import { getPublicPlatform, getResearchPlatform } from "@/lib/platforms";
import { PlatformDetail } from "@/components/PlatformDetail";
import { buildMetadata, breadcrumbJsonLd, reviewJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { platformPath, type CatalogKind } from "@/lib/catalog";
import { CategoryMark } from "@/components/visual/CategoryMark";

export async function productProfileMetadata(cat: CatalogKind, slug: string) {
  const p = await getResearchPlatform(slug, cat.id);
  const path = platformPath(cat.id, slug);
  if (!p) return buildMetadata({ title: "Platform not found", description: "The requested research profile is unavailable.", path, noIndex: true });
  return buildMetadata({
    title: safePlatformSeoTitle(p.seoTitle, p.name),
    description: p.seoDescription || p.short || cat.summary,
    path,
    type: "article",
  });
}

export async function ProductProfile({ cat, slug }: { cat: CatalogKind; slug: string }) {
  const p = await getPublicPlatform(slug, cat.id);
  if (!p) notFound();
  const path = platformPath(p.kind, p.slug);
  const bc = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: cat.plural, url: `${SITE_URL}/${cat.hub}` },
    { name: p.name, url: `${SITE_URL}${path}` },
  ]);
  const review = p.description ? reviewJsonLd(p, path) : null;
  return (
    <main className={`tp-profile tp-hub--${cat.hub}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }} />
      {review ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }} /> : null}
      <section className="shell tp-profile-hero">
        <CategoryMark id={cat.id} className="tp-hub-object" />
        <div>
          <p>{cat.plural} / research profile</p>
          <h1>{p.name}</h1>
          <p>Independent evidence-led platform research. Unpublished fields stay empty rather than estimated.</p>
        </div>
      </section>
      <PlatformDetail platform={p} />
    </main>
  );
}
