import Link from "next/link";
import { buildMetadata, webPageJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = buildMetadata({
  title: "TopPick FAQ — research, markets and accounts",
  description: "Answers about how TopPick researches products, why classes stay empty, how markets work, and what an account is for.",
  path: "/faq",
  keywords: ["TopPick FAQ", "crypto comparison questions", "is TopPick advice"],
});

const QA = [
  { q: "Does TopPick give investment advice?", a: "No. TopPick publishes general research and comparison information. It is not personal investment, legal or tax advice." },
  { q: "Why is a category empty?", a: "A niche stays empty until a reviewed public profile exists. We do not invent brands, fees, ratings or traffic to fill a page." },
  { q: "Why does a product appear in one country and not another?", a: "Product access and promotional eligibility are stored per market. A global homepage or an affiliate ad is not proof that you can use the product." },
  { q: "How should I compare two companies?", a: "Only inside the same class: exchange versus exchange, wallet versus wallet. Use the compare lab. Missing fields stay blank." },
  { q: "What is a product niche?", a: "A researched class with its own job and failure mode — futures, bridges, custody, stablecoins and others. Open /niches for the full map." },
  { q: "Do I need an account?", a: "No for reading. An account is for saving products, following companies and notifications. Partner workspaces stay separate." },
  { q: "Are offers and rewards ranked?", a: "No. Opportunities are classified by prize type and what you must do. They appear only when a published record exists." },
  { q: "Who pays TopPick?", a: "Partner compensation may apply. A commercial relationship never proves market eligibility or product quality. See the affiliate disclosure." },
];

export default function Page() {
  const schema = webPageJsonLd({ name: "TopPick FAQ", description: "Research, markets and account questions.", path: "/faq" });
  const faq = faqJsonLd(QA.map((item) => ({ question: item.q, answer: item.a })));
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "FAQ", url: `${SITE_URL}/faq` },
  ]);
  return (
    <main className="tp-faq-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="shell page-hero">
        <span>FAQ</span>
        <h1>Short answers. No invented scores.</h1>
        <p>If a fact is unpublished, TopPick leaves it unpublished. These questions cover research, markets, niches and accounts.</p>
      </section>
      <div className="tp-faq-list tp-faq">
        {QA.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/start">Start here</Link>
        <Link href="/how-we-rate">How we research</Link>
        <Link href="/legal/affiliate-disclosure">Affiliate disclosure</Link>
        <Link href="/legal/risk-disclosure">Risks</Link>
      </p>
    </main>
  );
}
