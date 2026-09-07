"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, LoaderCircle } from "lucide-react";

type Item = { id: string; title?: string; name?: string; kind: string; short: string; href?: string; slug?: string };

export function SearchClient() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const start = new URLSearchParams(window.location.search).get("q") || "";
    if (start) setQ(start);
  }, []);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) { setItems([]); return; }
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        setItems(j.items || []);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <section className="tp-search-console">
      <div className="tp-search-box">
        <Search />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search TopPick" aria-label="Search TopPick" />
        {loading && <LoaderCircle className="spin" />}
      </div>
      {q.trim().length > 1 && (
        <div className="tp-search-results">
          {!loading && !items.length ? (
            <p>No matching guides or published profiles. Try a product class, a term like custody, or open Learn.</p>
          ) : items.map((i) => (
            <Link key={i.id} href={i.href || "/search"}>
              <span>{(i.title || i.name || "?").slice(0, 2).toUpperCase()}</span>
              <div>
                <b>{i.title || i.name}</b>
                <small>{i.kind} · {i.short || "No published summary"}</small>
              </div>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
