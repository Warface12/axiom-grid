import { buildMetadata } from "@/lib/seo";
import { countPublished } from "@/lib/publicInventory";
import { OpportunityConstellation } from "@/components/OpportunityConstellation";
import Link from "next/link";

export async function generateMetadata() {
  const count = await countPublished("offer");
  return buildMetadata({
    title: "Crypto opportunities",
    description: "Understand reward types, then review sourced offers when they exist.",
    path: "/opportunities",
    noIndex: count === 0,
  });
}

export default async function Page() {
  const count = await countPublished("offer");
  return (
    <main className="tp-opp-page">
      <section className="shell tp-hub-hero">
        <p>OPPORTUNITIES</p>
        <h1>Rewards are not interchangeable.</h1>
        <p>Cash, crypto, credit and points look similar in ads. Classify the prize before you chase it.</p>
      </section>
      <OpportunityConstellation />
      <section className="shell content-shell">
        {count ? (
          <p className="tp-inline-link">{count} reviewed offers</p>
        ) : (
          <p>When a reviewed offer is published, it appears here with its type and conditions. Until then, use the map above and the guides.</p>
        )}
        <p className="tp-continue">
          <Link href="/learn">Guides</Link>
          <Link href="/finder">Finder</Link>
          <Link href="/markets">Your market</Link>
          <Link href="/compare">Compare products</Link>
        </p>
      </section>
    </main>
  );
}
