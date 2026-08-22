import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { guides } from "@/lib/demo-data";
import { buildMetadata } from "@/lib/seo";
export const metadata=buildMetadata({title:"Signals & Guides — TopPick.pro",description:"Evergreen guides for exchanges, brokers, wallets, fees and custody.",path:"/learn"});
export default function Page(){return <main className="shell content-shell"><section className="page-hero"><span>SIGNALS / EDUCATION</span><h1>Build a better decision model.</h1><p>Independent explainers for the structures behind digital-asset products.</p></section><div className="guide-grid">{guides.map(g=><Link className="prose-card" href={`/learn/${g.slug}`} key={g.slug}><small>{g.category.toUpperCase()} · {g.readTime}</small><h2>{g.title}</h2><p>{g.excerpt}</p><span>Read guide <ArrowUpRight size={14}/></span></Link>)}</div></main>}
