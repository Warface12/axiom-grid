"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { SearchResults } from "@/lib/types";

type Props = { onClose: () => void; onNavigate: (path: string) => void };

export function GlobalSearch({ onClose, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) inputRef.current?.focus(); }, [mounted]);

  useEffect(() => {
    if (!query.trim()) { setResults(null); setLoading(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Search failed");
        setResults(await res.json());
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults(null);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  const count = results ? results.casinos.length + results.bonuses.length + results.guides.length + results.sports.length + results.teams.length + results.leagues.length : 0;

  return createPortal(
    <div className="nv4-search-layer" role="dialog" aria-modal="true" aria-label="Search NivaroBet">
      <button className="nv4-search-backdrop" aria-label="Close search" onClick={onClose}/>
      <div className="nv4-search-modal">
        <div className="nv4-search-modal-head">
          <div><small>SEARCH NIVAROBET</small><strong>Find exactly what you need</strong></div>
          <button type="button" aria-label="Close search" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="nv4-global-input">
          <Search size={19}/>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Casino, bonus, guide or team..." aria-label="Global search" autoComplete="off"/>
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16}/></button> : <kbd>/</kbd>}
        </div>

        <div className="nv4-search-body" aria-live="polite">
          {loading ? <div className="nv4-search-state"><span className="nv4-search-loader"/> Searching…</div> : null}
          {!loading && !query.trim() ? <div className="nv4-search-suggestions"><small>TRY SEARCHING</small><div><button onClick={() => setQuery("no deposit")}>No deposit</button><button onClick={() => setQuery("free spins")}>Free spins</button><button onClick={() => setQuery("crypto")}>Crypto casinos</button></div></div> : null}
          {!loading && query.trim() && results ? <>
            <SearchSection title="Casinos" items={results.casinos.map(c => ({ label: c.name, sub: c.welcome_bonus || "Casino profile", path: `/casinos/${c.slug}` }))} onNavigate={onNavigate}/>
            <SearchSection title="Bonuses" items={results.bonuses.map(b => ({ label: b.title, sub: b.type, path: `/bonuses/${b.slug}` }))} onNavigate={onNavigate}/>
            <SearchSection title="Guides" items={results.guides.map(g => ({ label: g.title, sub: g.excerpt || "Guide", path: `/guides/${g.slug}` }))} onNavigate={onNavigate}/>
            <SearchSection title="Sports" items={results.sports.map(s => ({ label: s.slug, sub: s.status, path: `/sports/match/${s.slug}` }))} onNavigate={onNavigate}/>
            <SearchSection title="Teams" items={results.teams.map(t => ({ label: t.name, sub: "Team", path: `/sports?team=${t.slug}` }))} onNavigate={onNavigate}/>
            <SearchSection title="Leagues" items={results.leagues.map(l => ({ label: l.name, sub: "League", path: `/sports?league=${l.slug}` }))} onNavigate={onNavigate}/>
            {count === 0 ? <div className="nv4-search-state">No results for “{query}”</div> : null}
          </> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SearchSection({ title, items, onNavigate }: { title: string; items: { label: string; sub: string; path: string }[]; onNavigate: (path: string) => void }) {
  if (!items.length) return null;
  return <section className="nv4-search-section"><h4>{title}</h4>{items.slice(0, 5).map(item => <button key={item.path + item.label} onClick={() => onNavigate(item.path)}><span><strong>{item.label}</strong>{item.sub ? <small>{item.sub}</small> : null}</span><ArrowRight size={15}/></button>)}</section>;
}
