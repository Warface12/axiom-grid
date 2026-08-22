import Link from "next/link";
import { ArrowUpRight, Database, ShieldCheck } from "lucide-react";
import type { Platform, PlatformKind } from "@/lib/types";
import { PlatformCard } from "@/components/PlatformCard";
export function PlatformIndex({kind,items}:{kind:PlatformKind;items:Platform[]}){
 const label=kind==="exchange"?"Exchange":kind==="broker"?"Broker":"Wallet";
 if(items.length)return <div className="platform-grid">{items.map(p=><PlatformCard platform={p} key={p.slug}/>)}</div>;
 return <div className="ag-empty-directory"><div className="empty-index"><span>{label.toUpperCase()} DIRECTORY</span><h2>Verified public profiles will appear here.</h2><p>TopPick.pro keeps new records hidden by default. A {label.toLowerCase()} is published only after its product facts, source material and promotional eligibility have been reviewed.</p><div className="empty-actions"><Link href="/how-we-rate">Review methodology <ArrowUpRight/></Link><Link href="/markets">Browse market framework</Link></div></div><div className="empty-visual"><Database/><div><b>0</b><span>PUBLIC RECORDS</span></div><i/><div><ShieldCheck/><span>FAIL-CLOSED PUBLISHING</span></div></div></div>
}
