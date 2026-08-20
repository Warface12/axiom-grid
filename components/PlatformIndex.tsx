import Link from "next/link";
import { ArrowUpRight, Database, Plus, ShieldCheck } from "lucide-react";
import type { Platform, PlatformKind } from "@/lib/types";
export function PlatformIndex({kind}:{kind:PlatformKind;items:Platform[]}){
 const label=kind==="exchange"?"Exchange":kind==="broker"?"Broker":"Wallet";
 return <div className="ag-empty-directory"><div className="empty-index"><span>{label.toUpperCase()} DIRECTORY</span><h2>Public inventory starts clean.</h2><p>Demo brands were removed. Publish real {label.toLowerCase()} records only after research and market eligibility are reviewed in the admin control room.</p><div className="empty-actions"><Link href="/admin/platforms">Open platform admin <ArrowUpRight/></Link><Link href="/how-we-rate">Review methodology</Link></div></div><div className="empty-visual"><Database/><div><b>0</b><span>PUBLIC RECORDS</span></div><i/><div><ShieldCheck/><span>FAIL-CLOSED PUBLISHING</span></div></div></div>
}
