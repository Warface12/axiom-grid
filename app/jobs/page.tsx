import Link from "next/link";
import { buildMetadata, webPageJsonLd, itemListJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Crypto jobs — what you are actually trying to do",
  description: "Map a real job to product classes: buy crypto, hold keys, trade perps, move across chains, research fees, or check a market.",
  path: "/jobs",
  keywords: ["buy crypto", "self custody", "crypto futures", "cross chain bridge", "crypto tax software"],
});

const JOBS = [
  { href: "/exchanges", title: "Buy or sell on a venue", copy: "Custodial spot and derivatives venues. Compare entity, custody and fees — not a homepage slogan." },
  { href: "/wallets", title: "Hold keys yourself", copy: "Hardware, software and mobile wallets. Recovery design matters more than a bonus." },
  { href: "/brokers", title: "Use a broker", copy: "Forex, CFD and multi-asset. Ownership of the underlying asset is often not the product." },
  { href: "/futures", title: "Trade perps or futures", copy: "Dated futures and perpetuals. Funding and liquidation stay empty unless sourced." },
  { href: "/copy-trading", title: "Copy another account", copy: "Mirroring is still a custody and cost product. Past results are not a forecast." },
  { href: "/dex", title: "Swap on-chain", copy: "AMMs and order-book DEXs. Smart-contract risk replaces venue-custody risk." },
  { href: "/bridges", title: "Move value across chains", copy: "While funds are in flight the custody model is often neither a wallet nor an exchange." },
  { href: "/on-ramps", title: "Convert fiat", copy: "On-ramps and off-ramps. Country coverage is operator-specific." },
  { href: "/crypto-cards", title: "Spend from a card", copy: "Crypto cards compared on custody of float, fees as published, and market eligibility." },
  { href: "/staking", title: "Stake or restake", copy: "Lockups, receipt tokens and slashing — only when the operator publishes them." },
  { href: "/lending", title: "Lend or borrow", copy: "Collateral, liquidation and who holds the asset. APR is never invented." },
  { href: "/tax", title: "Report activity", copy: "Tax and accounting tools compared on supported venues and export methods." },
  { href: "/custody", title: "Use institutional custody", copy: "Qualified custodians. Bankruptcy remoteness only as published." },
  { href: "/markets", title: "Check your country first", copy: "Availability and promotional eligibility are stored separately." },
  { href: "/rpc", title: "Connect an app to a chain", copy: "RPC providers compared on published networks and who sees the requests." },
  { href: "/compliance", title: "Travel Rule / compliance", copy: "Vendors compared on published checks. This is not legal advice." },
  { href: "/prediction", title: "Price an event", copy: "Prediction markets. Odds are not a live tape on TopPick." },
  { href: "/etf", title: "Use a listed crypto ETF", copy: "Issuer, custody of the underlying, and the market where the share trades." },
];

export default function Page() {
  const schema = webPageJsonLd({ name: "TopPick jobs", description: "Job-based map into product classes.", path: "/jobs" });
  const list = itemListJsonLd(JOBS.map((job) => ({ name: job.title, url: `${SITE_URL}${job.href}` })));
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Jobs", url: `${SITE_URL}/jobs` },
  ]);
  return (
    <main className="tp-jobs-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="shell page-hero">
        <span>Jobs</span>
        <h1>Start from the work, not the brand.</h1>
        <p>Each job opens a researched class. If that class has no reviewed profile yet, the directory stays empty.</p>
      </section>
      <div className="tp-jobs-grid">
        {JOBS.map((job) => (
          <Link key={job.href} href={job.href} className="tp-job-card">
            <b>{job.title}</b>
            <p>{job.copy}</p>
          </Link>
        ))}
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/finder">Guided finder</Link>
        <Link href="/niches">All niches</Link>
        <Link href="/start">How to start</Link>
      </p>
    </main>
  );
}
