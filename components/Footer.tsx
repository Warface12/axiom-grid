import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { TopPickMark } from "@/components/TopPickMark";

export function Footer() {
  return (
    <footer className="ag-footer tp-footer">
      <div className="ag-footer-grid">
        <div>
          <Link href="/" className="ag-brand">
            <TopPickMark gradientId="tpMarkFooter" />
            <span><b>TopPick</b><em>.pro</em></span>
          </Link>
          <p>Independent comparison research for crypto exchanges, wallets, brokers and related tools. Availability, legal entity, product terms and commercial eligibility can vary by country.</p>
        </div>
        <details className="ag-footer-col" open>
          <summary>Explore</summary>
          <Link href="/exchanges">Exchanges</Link>
          <Link href="/brokers">Brokers</Link>
          <Link href="/wallets">Wallets</Link>
          <Link href="/dex">DEXs</Link>
          <Link href="/defi">DeFi</Link>
          <Link href="/niches">All niches</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/start">Start here</Link>
          <Link href="/finder">Product finder</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/search">Search</Link>
        </details>
        <details className="ag-footer-col">
          <summary>Research</summary>
          <Link href="/research">Research desk</Link>
          <Link href="/learn">Guides</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/how-we-rate">How we rate</Link>
          <Link href="/security">Security & custody</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/rewards">Reward types</Link>
        </details>
        <details className="ag-footer-col">
          <summary>Company & legal</summary>
          <Link href="/account">User account</Link>
          <Link href="/partners">Partners</Link>
          <Link href="/apps">Install app</Link>
          <Link href="/editorial-policy">Editorial policy</Link>
          <Link href="/source-policy">Source policy</Link>
          <Link href="/corrections">Corrections</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/legal/affiliate-disclosure">Affiliate disclosure</Link>
          <Link href="/legal/risk-disclosure">Risk disclosure</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
        </details>
      </div>
      <div className="ag-footer-bottom">
        <span>© {new Date().getFullYear()} {SITE_NAME}. Comparison publisher — not an exchange, broker, wallet provider or financial adviser.</span>
        <span>Partner compensation may apply. Research visibility does not equal product or market eligibility.</span>
      </div>
    </footer>
  );
}
