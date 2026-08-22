import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { getPublicPlatforms } from "@/lib/platforms";

export async function FeaturedPartners(){
  const items=(await getPublicPlatforms(undefined,12)).slice(0,8);
  return <section className="ag-partner-zone"><div className="ag-section-marker">TOPPICK / PARTNER RESEARCH</div><div className="ag-partner-head"><div><h2>Platforms we research</h2><p>Featured records appear here only after they are made public in the control room. XM is automatically prioritized when its approved public record is added.</p></div><Link href="/compare">Compare platforms <ArrowUpRight/></Link></div>{items.length?<div className="ag-partner-strip">{items.map(p=><Link href={`/${p.kind}s/${p.slug}`} className="ag-partner-pill" key={p.slug}>{p.logoUrl?<img src={p.logoUrl} alt="" width={34} height={34}/>:<span>{p.logoText}</span>}<div><b>{p.name}</b><small>{p.kind}</small></div>{p.status==="verified"&&<BadgeCheck/>}</Link>)}</div>:<div className="ag-partner-empty"><b>No public partner profiles yet.</b><span>Add XM, Eightcap and future partners from Admin → Inventory; keep “Publicly visible” off until the record is ready.</span></div>}</section>
}
