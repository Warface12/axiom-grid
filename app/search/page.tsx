import { Suspense } from "react";
import { SearchPageClient } from "@/components/SearchPageClient";
import { buildMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams;
  return buildMetadata({
    title: q ? `Search: ${q} — Nivaro` : "Search — Nivaro",
    description: "Search casinos, bonuses, sports, teams, leagues and guides.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow">GLOBAL SEARCH</span>
        <h1>Find exactly what you need.</h1>
        <p>Search across casinos, bonuses, sports, teams, leagues and guides.</p>
      </div>
      <Suspense fallback={<p className="search-empty">Loading search...</p>}>
        <SearchPageClient initialQuery={q || ""} />
      </Suspense>
    </main>
  );
}
