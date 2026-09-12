import { PlatformIndex } from "@/components/PlatformIndex";
import { buildMetadata, itemListJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getPublicPlatforms } from "@/lib/platforms";
import { CATALOG, type CatalogKind } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { platformPath } from "@/lib/catalog";
import { hubFaqs, hubCompareNotes } from "@/lib/hubCopy";
import { guides } from "@/lib/guides";
import { CategoryMark } from "@/components/visual/CategoryMark";
import Link from "next/link";

export async function productHubMetadata(cat: CatalogKind) {
  return buildMetadata({
    title: `${cat.plural} compared — TopPick.pro`,
    description: cat.summary,
    path: `/${cat.hub}`,
    keywords: [cat.plural, cat.label, cat.group, ...cat.subcategories, "crypto comparison", "research"],
  });
}

export async function ProductHub({ cat }: { cat: CatalogKind }) {
  const items = await getPublicPlatforms(cat.id);
  const related = CATALOG.filter((item) => item.group === cat.group && item.id !== cat.id).slice(0, 8);
  const hay = `${cat.id} ${cat.hub} ${cat.label} ${cat.plural} ${cat.summary}`.toLowerCase();
  const relatedGuides = guides.filter((guide) => {
    const blob = `${guide.slug} ${guide.title} ${guide.excerpt}`.toLowerCase();
    return blob.split(/\W+/).some((word) => word.length > 3 && hay.includes(word));
  }).slice(0, 3);
  const faqs = hubFaqs(cat);
  const notes = hubCompareNotes(cat);
  const list = items.length ? itemListJsonLd(items.map((item) => ({ name: item.name, url: `${SITE_URL}${platformPath(item.kind, item.slug)}` }))) : null;
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Niches", url: `${SITE_URL}/niches` },
    { name: cat.plural, url: `${SITE_URL}/${cat.hub}` },
  ]);
  return (
    <main className={`tp-hub tp-hub--${cat.hub} tp-hub--${cat.group.toLowerCase().replace(/\s+/g, "-")}`}>
      {list ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} /> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <section className="shell tp-hub-hero">
        <div>
          <p>{cat.group}</p>
          <h1>{cat.plural}</h1>
          <p>{cat.summary}</p>
          <p className="tp-hub-subs">{cat.subcategories.join(" · ")}</p>
          <p className="tp-chapter-links">
            <Link href="/compare">Compare in this class</Link>
            <Link href="/finder">Finder</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/niches">All niches</Link>
            <Link href="/markets">Markets</Link>
          </p>
        </div>
        <CategoryMark id={cat.id} className="tp-hub-object" />
      </section>
      <section className="shell content-shell">
        <PlatformIndex kind={cat.id} items={items} />
        <div className="tp-hub-read">
          <article className="tp-edu-card">
            <small>How to compare</small>
            <h2>Stay inside this class.</h2>
            <ul>
              {notes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </article>
          <article className="tp-edu-card tp-faq">
            <small>FAQ</small>
            <h2>Short answers for {cat.plural.toLowerCase()}.</h2>
            {faqs.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </article>
        </div>
        {relatedGuides.length ? (
          <nav className="tp-chapter-links" aria-label="Guides">
            {relatedGuides.map((guide) => (
              <Link key={guide.slug} href={`/learn/${guide.slug}`}>{guide.title}</Link>
            ))}
          </nav>
        ) : null}
        {related.length ? (
          <nav className="tp-chapter-links" aria-label="Related niches">
            {related.map((item) => (
              <Link key={item.id} href={`/${item.hub}`}>{item.plural}</Link>
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
