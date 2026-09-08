import { notFound } from "next/navigation";
import { getGuide, guides } from "@/lib/guides";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const g = getGuide(slug);
  return buildMetadata({
    title: g ? `${g.title} — TopPick.pro` : "Guide not found — TopPick.pro",
    description: g?.excerpt || "TopPick.pro research guide.",
    path: `/learn/${slug}`,
    noIndex: !g,
    type: "article",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Learn", url: `${SITE_URL}/learn` },
    { name: g.title, url: `${SITE_URL}/learn/${g.slug}` },
  ]);
  const faq = faqJsonLd(g.body.slice(0, 2).map((section) => ({ question: section.heading, answer: section.paragraphs[0] })));
  return (
    <main className="shell content-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <nav className="tp-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/learn">Learn</Link><span>/</span><span>{g.title}</span>
      </nav>
      <section className="page-hero">
        <span>{g.category.toUpperCase()} / {g.readTime}</span>
        <h1>{g.title}</h1>
        <p>{g.excerpt}</p>
      </section>
      <article className="prose-card">
        {g.body.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}
          </section>
        ))}
        <p><Link href="/how-we-rate">Read the research protocol</Link></p>
      </article>
    </main>
  );
}
