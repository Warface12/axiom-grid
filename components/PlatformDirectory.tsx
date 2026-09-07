"use client";

import { useMemo, useState } from "react";
import type { Platform } from "@/lib/types";
import { PlatformCard } from "@/components/PlatformCard";

export function PlatformDirectory({ items }: { items: Platform[] }) {
  const [query, setQuery] = useState("");
  const [custody, setCustody] = useState("all");
  const [featured, setFeatured] = useState(false);

  const custodyOptions = useMemo(
    () => ["all", ...Array.from(new Set(items.map((item) => item.custody).filter(Boolean) as string[]))],
    [items]
  );

  const filtered = items.filter((item) => {
    const haystack = `${item.name} ${item.short} ${item.tags.join(" ")}`.toLowerCase();
    if (query.trim() && !haystack.includes(query.trim().toLowerCase())) return false;
    if (featured && !item.featured) return false;
    if (custody !== "all" && item.custody !== custody) return false;
    return true;
  });

  return (
    <>
      <div className="tp-filter-bar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter this directory…" aria-label="Filter platforms" />
        <select value={custody} onChange={(e) => setCustody(e.target.value)} aria-label="Custody filter">
          {custodyOptions.map((option) => <option key={option} value={option}>{option === "all" ? "All custody notes" : option}</option>)}
        </select>
        <label>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured only
        </label>
      </div>
      {filtered.length ? (
        <div className="platform-grid">{filtered.map((p) => <PlatformCard platform={p} key={p.slug} />)}</div>
      ) : (
        <p className="tp-filter-empty">No published profiles match those filters. Filters are display-only and do not create extra indexable URLs.</p>
      )}
    </>
  );
}
