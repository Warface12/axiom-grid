import { MarketSwitcher } from "@/components/MarketSwitcher";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { SITE_NAME } from "@/lib/site";
import { TopPickMark } from "@/components/TopPickMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { CatalogNav } from "@/components/CatalogNav";
import { SearchHotkey } from "@/components/SearchHotkey";

export function Header() {
  return (
    <header className="ag-header">
      <SearchHotkey />
      <div className="ag-header-inner">
        <Link href="/" className="ag-brand" aria-label={`${SITE_NAME} home`}>
          <TopPickMark />
          <span><b>TopPick</b><em>.pro</em></span>
        </Link>
        <nav className="ag-nav" aria-label="Primary">
          <CatalogNav />
          <Link href="/compare">Compare</Link>
          <Link href="/finder">Tools</Link>
          <Link href="/learn">Research</Link>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/partners">Partners</Link>
        </nav>
        <div className="ag-header-actions">
          <Link href="/account" className="ag-icon-btn" aria-label="Account">
            <UserRound size={17} />
          </Link>
          <Link href="/search" className="ag-icon-btn" aria-label="Search">
            <Search size={17} />
          </Link>
          <MarketSwitcher />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
