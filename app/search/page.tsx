import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SearchClient } from "@/components/SearchClient";
import { CATALOG } from "@/lib/catalog";

export const metadata = buildMetadata({
  title: "Search TopPick research",
  description: "Search guides, categories, glossary terms and published platform profiles. Empty inventories stay empty.",
  path: "/search",
  noIndex: true,
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Search</span>
        <h1>Find research, not filler.</h1>
        <p>Search guides, glossary terms and published profiles. This page is not indexed.</p>
      </section>
      <section className="shell">
        <SearchClient />
      </section>
      <p className="tp-chapter-links shell">
        {CATALOG.slice(0, 12).map((cat) => (
          <Link key={cat.id} href={`/${cat.hub}`}>{cat.plural}</Link>
        ))}
        <Link href="/niches">All niches</Link>
        <Link href="/jobs">Jobs</Link>
        <Link href="/glossary">Glossary</Link>
      </p>
    </main>
  );
}
