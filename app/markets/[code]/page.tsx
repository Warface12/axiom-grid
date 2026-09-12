import { notFound } from "next/navigation";
import Link from "next/link";
import { MARKET_POLICIES, getMarketPolicy } from "@/lib/markets";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { CATALOG } from "@/lib/catalog";

export function generateStaticParams() {
  return MARKET_POLICIES.map((m) => ({ code: m.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const m = getMarketPolicy(code);
  return m
    ? buildMetadata({
        title: `${m.name} crypto research — TopPick.pro`,
        description: `Jurisdiction-aware research for exchanges, wallets, brokers and other niches in ${m.name}. Availability and promotion are stored separately.`,
        path: `/markets/${code.toLowerCase()}`,
        keywords: [m.name, m.code, "crypto availability", "market research"],
      })
    : {};
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const m = getMarketPolicy(code);
  if (!m) notFound();
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Markets", url: `${SITE_URL}/markets` },
    { name: m.name, url: `${SITE_URL}/markets/${code.toLowerCase()}` },
  ]);
  const faq = faqJsonLd([
    {
      question: `Can every product operate in ${m.name}?`,
      answer: "No. Product access is operator-specific. TopPick stores availability separately from whether a product can be promoted.",
    },
    {
      question: "Does a partner ad prove I can use the product?",
      answer: "No. Commercial eligibility is blocked until an approved, current market record exists.",
    },
  ]);
  return (
    <main className="tp-markets-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <section className="shell page-hero">
        <span>{m.code}</span>
        <h1>{m.name}</h1>
        <p>{m.notes}</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card">
          <b>Research availability</b>
          <p>Public research can exist independently of commercial promotion. {m.publicResearch ? "Research pages are enabled for this market." : "Research pages are withheld for this market."}</p>
        </article>
        <article className="tp-start-card">
          <b>Commercial default</b>
          <p>Partner links stay blocked until an explicit, current market record allows promotion.</p>
        </article>
      </div>
      <section className="shell content-shell">
        <h2>Start from a class</h2>
        <p className="tp-chapter-links">
          {CATALOG.slice(0, 18).map((cat) => (
            <Link key={cat.id} href={`/${cat.hub}`}>{cat.plural}</Link>
          ))}
          <Link href="/niches">All niches</Link>
        </p>
        <p className="tp-chapter-links">
          <Link href="/compare">Compare lab</Link>
          <Link href="/finder">Finder</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/markets">All markets</Link>
        </p>
      </section>
    </main>
  );
}
