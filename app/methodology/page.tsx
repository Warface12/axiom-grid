import Link from "next/link";
import { buildMetadata, webPageJsonLd, faqJsonLd, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { CATALOG } from "@/lib/catalog";
import { MARKET_POLICIES } from "@/lib/markets";

export const metadata = buildMetadata({
  title: "Research methodology — TopPick.pro",
  description: "How TopPick researches product classes: published facts only, empty fields stay empty, markets stay separate from promotion, and classes are never mixed.",
  path: "/methodology",
  keywords: ["crypto research methodology", "how TopPick compares exchanges", "empty fields research", "market eligibility"],
});

const STEPS = [
  {
    title: "Name the class",
    copy: "An exchange is not a wallet. A broker is not a DEX. A structured note is not an ETF. The first job is to put the product in one researched class.",
  },
  {
    title: "Read only what is published",
    copy: "Legal entity, custody, fees, lockups and markets come from the operator or a named filing. If a figure is missing, the cell stays empty.",
  },
  {
    title: "Keep markets separate",
    copy: `TopPick currently keeps ${MARKET_POLICIES.length} research markets. A global homepage is not proof you can open an account or that we can promote the product there.`,
  },
  {
    title: "Do not invent a ranking",
    copy: `${CATALOG.length} niches share the same rule: empty directories stay empty. Partner money can buy presence, not a fabricated score.`,
  },
];

export default function Page() {
  const schema = webPageJsonLd({
    name: "TopPick research methodology",
    description: "Evidence-first comparison rules for crypto and trading products.",
    path: "/methodology",
  });
  const article = articleJsonLd({
    name: "TopPick research methodology",
    description: "How classes, empty fields and markets are handled.",
    path: "/methodology",
  });
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Methodology", url: `${SITE_URL}/methodology` },
  ]);
  const faq = faqJsonLd([
    { question: "Do you estimate missing fees?", answer: "No. Undisclosed fees, yields, ratings and traffic stay empty." },
    { question: "Is this the same as How we rate?", answer: "How we rate explains score dimensions when a score exists. This page explains the desk rules that apply even when a class is still empty." },
    { question: "Can a partner change a fact?", answer: "Partners can submit official materials. Facts still need a published source. Compensation never fills an empty cell." },
  ]);
  return (
    <main className="tp-start-page tp-method-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <section className="shell page-hero">
        <span>Desk rules</span>
        <h1>How the research desk actually works.</h1>
        <p>TopPick is a comparison publisher. These four rules apply to every niche — including the ones that still have no public profiles.</p>
      </section>
      <div className="tp-start-grid">
        {STEPS.map((step, index) => (
          <article key={step.title} className="tp-start-card">
            <small>0{index + 1}</small>
            <b>{step.title}</b>
            <p>{step.copy}</p>
          </article>
        ))}
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/how-we-rate">How we rate</Link>
        <Link href="/source-policy">Source policy</Link>
        <Link href="/editorial-policy">Editorial policy</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/niches">All niches</Link>
      </p>
    </main>
  );
}
