import Link from "next/link";
import { ChevronDown, Search, Star } from "lucide-react";
import { EmptyState } from "@/components/GuideCard";
import { getCasinoCount, getCasinos, getSeoSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { formatRating } from "@/lib/utils";

type Props = { searchParams: Promise<{ q?: string; crypto?: string; noDeposit?: string; freeSpins?: string; page?: string }> };
const PAGE_SIZE = 24;

export async function generateMetadata() {
  const seo = await getSeoSettings("casinos");
  return buildMetadata({ title: seo?.title, description: seo?.description, path: "/casinos" });
}

export default async function CasinosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = { search: params.q, crypto: params.crypto === "true", noDeposit: params.noDeposit === "true", freeSpins: params.freeSpins === "true" };
  const [casinos, total] = await Promise.all([getCasinos({ ...filters, limit: PAGE_SIZE }), getCasinoCount(filters)]);
  return <main className="container ref-inner-page">
    <div className="ref-breadcrumb">Home <span>›</span> Casinos</div>
    <header className="ref-page-header"><h1>CASINOS</h1><p>Explore our hand-picked selection of the best online casinos. We review and rank casinos based on bonuses, game variety, payouts, security and more.</p></header>
    <form className="ref-filter-row" action="/casinos" method="get">
      <label className="ref-filter-select">All Casinos <ChevronDown size={14}/></label>
      <label className="ref-filter-select">All Licenses <ChevronDown size={14}/></label>
      <label className="ref-filter-select">All Features <ChevronDown size={14}/></label>
      <div className="ref-list-search"><Search size={15}/><input name="q" defaultValue={params.q || ""} placeholder="Search"/></div>
      <label className="ref-filter-select ref-sort">Sort by: Popular <ChevronDown size={14}/></label>
    </form>
    {casinos.length ? <section className="ref-directory-list">
      {casinos.map((casino) => {
        const rating = Number(casino.rating) > 0 ? formatRating(casino.rating) : null;
        return <article className="ref-directory-row" key={casino.id}>
          <div className="ref-directory-logo">{casino.logo_url ? <img src={casino.logo_url} alt={`${casino.name} logo`} loading="lazy"/> : <strong>{casino.name.slice(0,2).toUpperCase()}</strong>}</div>
          <div className="ref-directory-copy"><h2>{casino.name}</h2>{rating ? <span className="ref-directory-rating"><Star size={12} fill="currentColor"/> {rating}</span> : null}<div className="ref-mini-tags"><span>Exclusive</span><span>Sportsbook</span><span>Live Casino</span></div><p>{casino.welcome_bonus || "Exclusive partner offer"}</p></div>
          <div className="ref-directory-actions"><Link className="ref-play-btn" href={casino.affiliate_url ? `/go/${casino.id}?source=/casinos` : `/casinos/${casino.slug}`}>Play Now</Link><Link href={`/casinos/${casino.slug}`}>Read Review</Link></div>
        </article>;
      })}
    </section> : <EmptyState title="No casinos found" message="Try another filter or search."/>}
    <div className="ref-result-count">{total} casino{total === 1 ? "" : "s"}</div>
  </main>;
}
