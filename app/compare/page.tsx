import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getPublicPlatforms } from "@/lib/platforms";
import { CompareClient } from "@/components/CompareClient";

export const metadata = buildMetadata({
  title: "Compare Platforms — TopPick.pro",
  description: "Compare exchanges, brokers and wallets by product type, custody, fees, security and published research notes.",
  path: "/compare",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const params = await searchParams;
  const platforms = await getPublicPlatforms(undefined, 48);
  const initialIds = (params.ids || "").split(",").map((v) => v.trim()).filter(Boolean);
  return (
    <main className="shell content-shell">
      <section className="page-hero">
        <span>COMPARE</span>
        <h1>Compare like with like.</h1>
        <p>Exchanges, brokers and wallets are separated because the products, risks and custody models are fundamentally different. Comparison uses only published research fields — never invented ratings.</p>
      </section>
      {platforms.length ? (
        <CompareClient platforms={platforms} initialIds={initialIds} />
      ) : (
        <section className="ag-lanes">
          <Link className="ag-lane" href="/exchanges"><div className="lane-copy"><small>LIQUIDITY / CUSTODY</small><h2>Exchange research</h2><p>Fees, funding, assets, security and market access.</p></div><ArrowUpRight /></Link>
          <Link className="ag-lane" href="/brokers"><div className="lane-copy"><small>EXECUTION / PRODUCTS</small><h2>Broker research</h2><p>Spreads, instruments, entities and platform access.</p></div><ArrowUpRight /></Link>
          <Link className="ag-lane" href="/wallets"><div className="lane-copy"><small>CUSTODY / RECOVERY</small><h2>Wallet research</h2><p>Control, recovery, supported assets and security model.</p></div><ArrowUpRight /></Link>
        </section>
      )}
    </main>
  );
}
