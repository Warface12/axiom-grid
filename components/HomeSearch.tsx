"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HomeSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }
  return (
    <form className="tp-home-search" onSubmit={onSubmit} role="search">
      <label className="sr-only" htmlFor="home-search">Search TopPick</label>
      <input id="home-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guides, glossary, categories and published profiles" />
      <button type="submit">Search</button>
    </form>
  );
}
