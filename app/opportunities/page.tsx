import { buildMetadata } from "@/lib/seo";
import { countPublished } from "@/lib/publicInventory";

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
        <p>Rewards are classified as cash, crypto, trading credit, points or unknown. Game coins are never presented as dollars. This index is hidden from search until a real offer is published.</p>
      </section>
      <section className="shell content-shell">
        <div className="tp-state-card">
          <b>{count ? `${count} published offers` : "No published offers yet"}</b>
          <p>Bonuses, trading offers, learn & earn, staking, cards, wallets, airdrops, events, games and launches appear here only after review.</p>
        </div>
      </section>
    </main>
  );
}
