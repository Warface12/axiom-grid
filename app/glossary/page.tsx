import { buildMetadata, faqJsonLd, webPageJsonLd } from "@/lib/seo";
import { GLOSSARY } from "@/lib/glossary";
import { SITE_NAME } from "@/lib/site";

export const metadata = buildMetadata({
  title: `Crypto glossary — ${SITE_NAME}`,
  description: "Plain-language definitions for custody, KYC, DEX vs CEX, fees, ramps and staking — written for research, not for trading tips.",
  path: "/glossary",
  keywords: ["crypto glossary", "custody", "KYC", "DEX", "maker taker"],
});

export default function Page() {
  const schema = webPageJsonLd({
    name: "Crypto research glossary",
    description: "Definitions used in TopPick research and comparison pages.",
    path: "/glossary",
  });
  const faq = faqJsonLd(GLOSSARY.slice(0, 6).map((item) => ({ question: `What does ${item.term} mean?`, answer: item.definition })));
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <section className="shell page-hero">
        <span>RESEARCH LANGUAGE</span>
        <h1>A glossary for comparing platforms honestly</h1>
        <p>These definitions explain how TopPick talks about products. They are educational, not investment, legal or tax advice, and they do not rank any company.</p>
      </section>
      <section className="shell content-shell tp-glossary-list">
        {GLOSSARY.map((item) => (
          <article key={item.slug} id={item.slug} className="tp-glossary-item">
            <b>{item.term}</b>
            <p>{item.definition}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
