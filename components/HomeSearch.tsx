"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HomeSearch({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }
  return (
    <form className={`tp-home-search${compact ? " is-compact" : ""}`} onSubmit={onSubmit} role="search">
      <label className="sr-only" htmlFor="home-search">Search TopPick</label>
      <input
        id="home-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search TopPick"
        autoComplete="off"
        enterKeyHint="search"
      />
      <button type="submit" aria-label="Search">
        <Search size={18} />
        <span>Search</span>
      </button>
    </form>
  );
}
