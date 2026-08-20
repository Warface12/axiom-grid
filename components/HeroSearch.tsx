"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, Gift, Coins, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

const POPULAR = [
  { label: "No Deposit", href: "/bonuses?type=no+deposit", icon: Gift },
  { label: "Free Spins", href: "/bonuses?type=free+spins", icon: Sparkles },
  { label: "Crypto", href: "/casinos?crypto=true", icon: Coins },
  { label: "Top Rated", href: "/casinos", icon: ShieldCheck },
];

export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
  }

  return (
    <div className="nv4-search-area">
      <form className="nv4-search" onSubmit={handleSubmit}>
        <Search size={18} aria-hidden="true" />
        <input aria-label="Search NivaroBet" placeholder="Search a casino, bonus or guide" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        <button type="submit" disabled={!query.trim()}><span>Search</span><Search size={15}/></button>
      </form>
      <div className="nv4-popular">
        <small>Popular</small>
        {POPULAR.map((item) => {
          const Icon = item.icon;
          return <button key={item.label} type="button" onClick={() => router.push(item.href)}><Icon size={12}/>{item.label}</button>;
        })}
      </div>
    </div>
  );
}
