import Link from "next/link";
import { ChevronDown, Gift } from "lucide-react";
import { EmptyState } from "@/components/GuideCard";
import { getBonuses, getSeoSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ q?: string; type?: string }> };
export async function generateMetadata() { const seo = await getSeoSettings("bonuses"); return buildMetadata({ title: seo?.title, description: seo?.description, path: "/bonuses" }); }

export default async function BonusesPage({ searchParams }: Props) {
  const params = await searchParams;
  const bonuses = await getBonuses({ search: params.q, type: params.type });
  return <main className="container ref-inner-page">
    <div className="ref-breadcrumb">Home <span>›</span> Bonuses</div>
    <header className="ref-page-header"><h1>BONUSES</h1><p>Find the best casino bonuses, free spins and special promotions from top online casinos.</p></header>
    <form className="ref-filter-row" action="/bonuses" method="get"><label className="ref-filter-select">All Bonuses <ChevronDown size={14}/></label><label className="ref-filter-select">All Types <ChevronDown size={14}/></label><label className="ref-filter-select">All Casinos <ChevronDown size={14}/></label><label className="ref-filter-select ref-sort">Sort by: Newest <ChevronDown size={14}/></label></form>
    {bonuses.length ? <section className="ref-directory-list">{bonuses.map((bonus, i) => <article className="ref-bonus-row" key={bonus.id}>
      <div className={`ref-bonus-row-art tone-${["violet","green","red"][i%3]}`}><Gift size={36}/></div>
      <div className="ref-directory-copy"><h2>{bonus.amount || bonus.title} <span className="ref-new">NEW</span></h2><p>{bonus.type || "Welcome Bonus"}</p><small>{bonus.casino?.name || "Featured casino"}</small></div>
      <div className="ref-directory-actions"><Link className="ref-red-btn" href={`/bonuses/${bonus.slug}`}>Get Bonus</Link><Link href={`/bonuses/${bonus.slug}`}>Details</Link></div>
    </article>)}</section> : <EmptyState title="No bonuses found" message="Try another filter."/>}
  </main>;
}
