"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchResults } from "@/lib/types";

export function SearchPageClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!initialQuery.trim()) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(initialQuery.trim())}`)
      .then((r) => r.json())
      .then(setResults)
      .finally(() => setLoading(false));
  }, [initialQuery]);

  async function handleSearch(q: string) {
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="filterbar">
        <form className="mini-search" onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}>
          <Search size={18} />
          <input
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="primary-btn">Search</button>
        </form>
      </div>

      {loading && <p className="search-empty">Searching...</p>}
      {!loading && !query.trim() && <p className="search-empty">Enter a search term to find casinos, bonuses, sports and guides.</p>}
      {!loading && query.trim() && results && <SearchResultsView results={results} query={query} />}
    </>
  );
}

function SearchResultsView({ results, query }: { results: SearchResults; query: string }) {
  const total = results.casinos.length + results.bonuses.length + results.guides.length +
    results.sports.length + results.teams.length + results.leagues.length;

  if (total === 0) return <p className="search-empty">No results for &quot;{query}&quot;</p>;

  return (
    <div className="search-page-results">
      <ResultGroup title="Casinos" items={results.casinos.map((c) => ({ label: c.name, href: `/casinos/${c.slug}` }))} />
      <ResultGroup title="Bonuses" items={results.bonuses.map((b) => ({ label: b.title, href: `/bonuses/${b.slug}` }))} />
      <ResultGroup title="Guides" items={results.guides.map((g) => ({ label: g.title, href: `/guides/${g.slug}` }))} />
      <ResultGroup title="Sports" items={results.sports.map((s) => ({ label: s.slug, href: `/sports/match/${s.slug}` }))} />
      <ResultGroup title="Teams" items={results.teams.map((t) => ({ label: t.name, href: `/sports?team=${t.slug}` }))} />
      <ResultGroup title="Leagues" items={results.leagues.map((l) => ({ label: l.name, href: `/sports?league=${l.slug}` }))} />
    </div>
  );
}

function ResultGroup({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="search-group">
      <h2>{title}</h2>
      <div className="search-group-list">
        {items.map((item) => (
          <Link key={item.href + item.label} href={item.href}>{item.label}</Link>
        ))}
      </div>
    </section>
  );
}
