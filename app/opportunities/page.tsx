import { buildMetadata } from "@/lib/seo";
import { countPublished } from "@/lib/publicInventory";
import { OFFER_TYPES } from "@/lib/ecosystem";
import { OpportunityTaxonomy } from "@/components/OpportunityTaxonomy";
import Link from "next/link";

export async function generateMetadata() {
  const count = await countPublished("offer");
  return buildMetadata({
    title: "Crypto opportunities",
    description: "Verified bonuses, learn-and-earn, staking and launch offers — only when a sourced record exists.",
    path: "/opportunities",
    noIndex: count === 0,
  });
}

export default async function Page() {
  const count = await countPublished("offer");
  return (
    <main>
      <section className="shell page-hero">
        <span>OPPORTUNITIES</span>
        <h1>Offers with conditions attached.</h1>
        <p>Rewards are classified as cash, crypto, trading credit, points or unknown. Game coins are never presented as dollars.</p>
      </section>
      <section className="shell content-shell">
        <OpportunityTaxonomy />
        <div className="tp-state-card">
          <b>{count ? `${count} published offers` : "Reviewed offers will appear here"}</b>
          <p>Welcome offers, trading credit, learn & earn, staking, cards, airdrops and launches appear only after review. Game coins are never presented as dollars.</p>
          <p><Link href="/learn">Read independent guides</Link> while this index waits for a sourced offer.</p>
        </div>
        <div className="tp-tool-grid" style={{ marginTop: 24 }}>
          {OFFER_TYPES.slice(0, 8).map((type) => (
            <article key={type} className="tp-tool-card"><small>TYPE</small><b>{type.replace(/_/g, " ")}</b><p>How TopPick can classify an offer. Not a live promotion.</p></article>
          ))}
        </div>
      </section>
    </main>
  );
}
