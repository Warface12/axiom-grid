import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { guides } from "@/lib/guides";
import { GLOSSARY } from "@/lib/glossary";
import { buildMetadata, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { LearnAtlas } from "@/components/visual/LearnAtlas";

export const metadata = buildMetadata({
  title: "Learn crypto products — TopPick.pro",
  description: "Evergreen guides for exchanges, brokers, wallets, fees and custody. Educational research, not personal advice.",
  path: "/learn",
});

export default function Page() {
  const schema = webPageJsonLd({
    name: "Learn crypto products",
    description: "Evergreen guides for custody, fees, venues and on-chain classes.",
    path: "/learn",
  });
  const list = itemListJsonLd(guides.map((guide) => ({ name: guide.title, url: `${SITE_URL}/learn/${guide.slug}` })));
  return (
    <main className="tp-learn-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <section className="shell page-hero">
        <span>Learn</span>
        <h1>Understand the product before you use it.</h1>
        <p>Guides on custody, fees, brokers versus exchanges, and how to read a platform page. This is not personalized investment advice.</p>
      </section>
      <LearnAtlas />
      <section className="shell content-shell">
        <h2>All guides</h2>
        <div className="guide-grid">
          {guides.map((g) => (
            <Link className="prose-card tp-edu-card" href={`/learn/${g.slug}`} key={g.slug}>
              <small>{g.category.toUpperCase()} · {g.readTime}</small>
              <h2>{g.title}</h2>
              <p>{g.excerpt}</p>
              <span>Read guide <ArrowUpRight size={14} /></span>
            </Link>
          ))}
        </div>
        <h2>Visual glossary</h2>
        <div className="tp-glossary-list">
          {GLOSSARY.slice(0, 6).map((item) => (
            <article key={item.slug} className="tp-glossary-item">
              <b>{item.term}</b>
              <p>{item.definition}</p>
            </article>
          ))}
        </div>
        <p className="tp-chapter-links">
          <Link href="/glossary">Full glossary</Link>
          <Link href="/topics">Topics</Link>
          <Link href="/start">Start here</Link>
          <Link href="/faq">FAQ</Link>
        </p>
      </section>
    </main>
  );
}
