import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { TopPickMark } from "@/components/TopPickMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { CatalogNav } from "@/components/CatalogNav";
import { SearchHotkey } from "@/components/SearchHotkey";
import { MarketSwitcher } from "@/components/MarketSwitcher";
import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="ag-header tp-header">
      <SearchHotkey />
      <div className="ag-header-inner">
        <Link href="/" className="ag-brand" aria-label={`${SITE_NAME} home`}>
          <TopPickMark gradientId="tpMarkHeader" />
          <span><b>TopPick</b><em>.pro</em></span>
        </Link>
        <nav className="ag-nav" aria-label="Primary">
          <CatalogNav />
          <Link href="/jobs">Jobs</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/research">Research</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/learn">Learn</Link>
        </nav>
        <div className="ag-header-actions">
          <Link href="/search" className="ag-icon-btn" aria-label="Search TopPick">
            <Search size={17} />
          </Link>
          <div className="tp-header-aux">
            <Link href="/account" className="ag-icon-btn tp-account-chip" aria-label="User account">Account</Link>
            <Link href="/partners" className="ag-icon-btn tp-partner-chip" prefetch={false}>Partner</Link>
            <MarketSwitcher />
            <ThemeToggle />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
