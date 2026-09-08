import { buildMetadata } from "@/lib/seo";
import { OpportunityConstellation } from "@/components/OpportunityConstellation";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Reward types — TopPick.pro",
  description: "Classify cash, crypto, credit, points and conditional prizes before chasing an offer. GEO eligibility is shown only when a market record exists.",
  path: "/rewards",
});

export default function Page() {
  return (
    <main className="tp-rewards-page">
      <section className="shell page-hero">
        <span>REWARD TYPES</span>
        <h1>Classify the prize before the campaign.</h1>
        <p>This page is a typology. It does not invent bonuses, APYs or expiration dates. Live offers appear on Opportunities only after a reviewed record exists.</p>
      </section>
      <OpportunityConstellation />
      <section className="shell content-shell">
        <div className="tp-empty-guide">
          <h2>How TopPick treats rewards</h2>
          <ul>
            <li>Cash, crypto, credit and points are different instruments</li>
            <li>GEO eligibility is a stored market rule, not a guess from a banner</li>
            <li>Expiration is shown only when a real date exists on the record</li>
          </ul>
          <div className="tp-continue">
            <Link href="/opportunities">Opportunities</Link>
            <Link href="/learn">Guides</Link>
            <Link href="/markets">Markets</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
