import Link from "next/link";
import { Search } from "lucide-react";
import { SITE_NAME } from "@/lib/site";
export function Header(){return <header className="ag-header"><div className="ag-header-inner">
<Link href="/" className="ag-brand" aria-label={`${SITE_NAME} home`}><span className="ag-brand-glyph"><i/><i/><i/><i/></span><span>{SITE_NAME}</span></Link>
<nav className="ag-nav" aria-label="Primary"><Link href="/exchanges">Exchanges</Link><Link href="/brokers">Brokers</Link><Link href="/wallets">Wallets</Link><Link href="/compare">Compare</Link><Link href="/learn">Signals</Link><Link href="/markets">Markets</Link></nav>
<div className="ag-header-actions"><Link href="/search" className="ag-icon-btn" aria-label="Search"><Search size={17}/></Link></div>
</div></header>}
