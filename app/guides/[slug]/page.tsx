import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getGuideBySlug } from "@/lib/data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return buildMetadata({ title: "Guide Not Found", noIndex: true });
  return buildMetadata({
    title: guide.seo_title || `${guide.title} — Nivaro`,
    description: guide.seo_description || guide.excerpt || undefined,
    path: `/guides/${slug}`,
    ogImage: guide.featured_image_url,
    type: "article",
  });
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <main className="container page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(guide)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: "Home", url: SITE_URL },
        { name: "Guides", url: `${SITE_URL}/guides` },
        { name: guide.title, url: `${SITE_URL}/guides/${slug}` },
      ])) }} />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: guide.title }]} />

      <article className="guide-article">
        {guide.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guide.featured_image_url} alt={guide.title} className="guide-hero-image" />
        )}
        <span className="eyebrow">{guide.categories.join(" • ") || "Guide"}</span>
        <h1>{guide.title}</h1>
        {guide.excerpt && <p className="guide-excerpt">{guide.excerpt}</p>}
        <div className="guide-content" dangerouslySetInnerHTML={{ __html: guide.content.replace(/\n/g, "<br/>") }} />
        {guide.tags.length > 0 && (
          <div className="tag-row">{guide.tags.map((t) => <span key={t}>{t}</span>)}</div>
        )}
      </article>
    </main>
  );
}
