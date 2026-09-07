import Link from "next/link";
import { buildMetadata, faqJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Partner with TopPick",
  description: "Apply for verified partner access to advertise, submit offers, and manage a company presence. Affiliate relationships are optional and separately controlled.",
  path: "/partners",
});

const faq = [
  { question: "Who can apply?", answer: "Company representatives, partnership or affiliate managers, marketing leads, and authorized agencies. This is not a consumer sign-up." },
  { question: "Do we need an affiliate relationship?", answer: "No. You can advertise or manage a company presence with no TopPick affiliate program. Affiliate URLs are added by TopPick only when a real program exists." },
  { question: "Can we edit TopPick reviews?", answer: "No. Partners cannot change editorial ratings, independent conclusions, warnings or organic rankings." },
  { question: "How are deposits tracked?", answer: "TopPick records its own clicks. Registrations and deposits appear only after an authorized server-to-server or API integration. Missing measurement is shown as Not tracked, not as zero." },
  { question: "Can agencies apply?", answer: "Yes. Agency access is scoped per company after authorization. A personal mailbox does not automatically verify a company." },
];

export default function Page() {
  const schema = webPageJsonLd({ name: "TopPick partners", description: "B2B partner, advertising and affiliate explanation.", path: "/partners" });
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <section className="shell page-hero">
        <span>B2B / PARTNERS</span>
        <h1>Advertise, partner, or both — without buying a review.</h1>
        <p>TopPick is a research and discovery publisher. Verified companies can run disclosed campaigns and submit official information. Editorial conclusions stay with TopPick.</p>
        <div className="ag-hero-cta" style={{ marginTop: 20 }}>
          <Link href="/partners/apply">Apply for partner access</Link>
          <Link href="/partner">Partner sign-in</Link>
        </div>
      </section>
      <section className="shell content-shell simple-grid">
        <article className="prose-card"><h3>Three commercial models</h3><p>Owner-managed affiliate (no partner login required). Verified advertiser with no affiliate link. Or both, when a real agreement exists.</p></article>
        <article className="prose-card"><h3>What you can manage</h3><p>Company presence, products, offers, campaigns, GEO targeting, creatives, team access, billing and conversion integrations — after verification.</p></article>
        <article className="prose-card"><h3>Tracking, without magic</h3><p>Click → approved destination → optional authorized postback → verified event ledger → analytics and reconciliation. Unconnected events stay Not tracked.</p></article>
        <article className="prose-card"><h3>Disclosed placements</h3><p>Sponsored modules are labeled. Paying for inventory does not move an independent ranking.</p></article>
      </section>
      <section className="shell content-shell tp-glossary-list">
        {faq.map((item) => (
          <article key={item.question} className="tp-glossary-item"><b>{item.question}</b><p>{item.answer}</p></article>
        ))}
      </section>
    </main>
  );
}
