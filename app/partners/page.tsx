import Link from "next/link";
import { buildMetadata, faqJsonLd, webPageJsonLd } from "@/lib/seo";
import { PartnerFlow, PartnerCtas } from "@/components/PartnerFlow";
import { PartnerNetwork } from "@/components/visual/PartnerNetwork";

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
    <main className="tp-partners-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <section className="shell tp-hub-hero">
        <p>PARTNERS</p>
        <h1>Distribution without buying a review.</h1>
        <p>Verified companies can run disclosed campaigns and submit official information. Editorial conclusions stay with TopPick.</p>
        <PartnerCtas />
      </section>
      <PartnerNetwork />
      <section className="shell content-shell">
        <h2 className="tp-flow-title">From company to measurement</h2>
        <PartnerFlow />
      </section>
      <section className="shell content-shell tp-glossary-list">
        {faq.map((item) => (
          <article key={item.question} className="tp-faq-row"><b>{item.question}</b><p>{item.answer}</p></article>
        ))}
      </section>
    </main>
  );
}
