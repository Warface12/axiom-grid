import Link from "next/link";
import { Globe2, ShieldCheck, Radar, ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { MARKET_POLICIES } from "@/lib/markets";
import { MarketGlobe } from "@/components/MarketGlobe";

export const metadata = buildMetadata({
  title: "Markets — TopPick.pro",
  description: "Country-aware discovery for crypto products. Availability and promotional eligibility are tracked separately.",
  path: "/markets",
});

export default function Page() {
  return (
    <main className="shell content-shell">
      <section className="page-hero">
        <span>MARKETS</span>
        <h1>Country is part of the product.</h1>
        <p>Whether a provider can serve you, and whether TopPick can promote it, are different questions. We only promote when the market record is current.</p>
      </section>
      <MarketGlobe showCopy={false} />
      <div className="market-grid">
        {MARKET_POLICIES.map((m) => (
          <Link className="market-card" key={m.code} href={`/markets/${m.code.toLowerCase()}`}>
            <Globe2 />
            <small>{m.code}</small>
            <h2>{m.name}</h2>
            <p>{m.notes}</p>
            <span>Open this market <ArrowUpRight /></span>
          </Link>
        ))}
      </div>
      <section className="ag-system-map">
        <div className="sys-row"><span>01</span><b><ShieldCheck /> Product availability</b><em>Can the provider offer the product in this market?</em></div>
        <div className="sys-row"><span>02</span><b><Radar /> Commercial eligibility</b><em>Can TopPick promote it here?</em></div>
        <div className="sys-row"><span>03</span><b><Globe2 /> Evidence freshness</b><em>Is the approval current and source-backed?</em></div>
      </section>
    </main>
  );
}
