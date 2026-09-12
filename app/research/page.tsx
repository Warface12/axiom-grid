import Link from "next/link";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";
import { CATALOG } from "@/lib/catalog";
import { guides } from "@/lib/guides";
import { MARKET_POLICIES } from "@/lib/markets";
import { ResearchEngine } from "@/components/visual/ResearchEngine";
import { MethodologyTrack } from "@/components/MethodologyTrack";

export const metadata = buildMetadata({
  title: "Research desk — TopPick.pro",
  description: "TopPick research streams, verification methodology and collections. Findings stay empty when a source does not exist.",
  path: "/research",
});

export default function Page() {
  const schema = webPageJsonLd({
    name: "TopPick research desk",
    description: "Intelligence center for methodology, product classes and guides.",
    path: "/research",
  });
  return (
    <main className="tp-research-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="shell page-hero">
        <span>Research desk</span>
        <h1>Intelligence, not a news ticker.</h1>
        <p>Streams, methodology and collections. No simulated live market data. Unpublished facts stay unpublished.</p>
      </section>
      <ResearchEngine />
      <section className="shell content-shell">
        <h2>Research streams</h2>
        <div className="tp-stream-grid">
          <article className="tp-edu-card">
            <small>Latest findings</small>
            <b>Guides that change how you read a profile</b>
            <p>Custody, fees, brokers versus exchanges — written as research, not tips.</p>
            <Link href="/learn">Open Learn</Link>
          </article>
          <article className="tp-edu-card">
            <small>Updated products</small>
            <b>Public profiles only</b>
            <p>When a reviewed record exists, it appears in its class. Empty classes stay empty.</p>
            <Link href="/exchanges">Browse exchanges</Link>
          </article>
          <article className="tp-edu-card">
            <small>Market changes</small>
            <b>{MARKET_POLICIES.length} configured markets</b>
            <p>Availability and promotion are stored separately for each market on this list.</p>
            <Link href="/markets">Open markets</Link>
          </article>
          <article className="tp-edu-card">
            <small>Verification</small>
            <b>How a record becomes public</b>
            <p>Imported is not verified. Partner links never rewrite editorial conclusions.</p>
            <Link href="/methodology">Desk rules</Link>
          </article>
        </div>
        <h2>Collections</h2>
        <div className="tp-universe">
          {Array.from(new Set(CATALOG.map((cat) => cat.group))).map((group) => {
            const items = CATALOG.filter((cat) => cat.group === group);
            return (
              <article key={group} className="tp-edu-card">
                <small>{items.length} classes</small>
                <b>{group}</b>
                <p>{items.map((item) => item.plural).join(" · ")}</p>
                <Link href="/niches">Open {group}</Link>
              </article>
            );
          })}
        </div>
        <h2>Guides in this desk</h2>
        <div className="tp-atlas-guides">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/learn/${guide.slug}`} className="tp-edu-card">
              <small>{guide.category} · {guide.readTime}</small>
              <b>{guide.title}</b>
              <span>{guide.excerpt}</span>
            </Link>
          ))}
        </div>
      </section>
      <MethodologyTrack />
    </main>
  );
}
