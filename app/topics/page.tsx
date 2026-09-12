import Link from "next/link";
import { buildMetadata, webPageJsonLd, itemListJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { guides } from "@/lib/guides";
import { GLOSSARY } from "@/lib/glossary";
import { SITE_URL } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Crypto research topics — TopPick.pro",
  description: "Topic map for custody, fees, bridges, lending, restaking, stablecoins and market access. Guides and glossary, not a news ticker.",
  path: "/topics",
  keywords: ["crypto custody", "crypto fees", "cross chain bridge", "crypto lending", "restaking", "stablecoin redemption"],
});

const CLUSTERS = [
  { title: "Custody", links: [
    { href: "/security", label: "Security desk" },
    { href: "/wallets", label: "Wallets" },
    { href: "/custody", label: "Institutional custody" },
    { href: "/learn/self-custody-basics", label: "Self-custody basics" },
  ] },
  { title: "Cost", links: [
    { href: "/fees", label: "Fees education" },
    { href: "/learn/crypto-fees-explained", label: "Fees guide" },
    { href: "/tax", label: "Tax & accounting" },
  ] },
  { title: "Venues", links: [
    { href: "/exchanges", label: "Exchanges" },
    { href: "/brokers", label: "Brokers" },
    { href: "/futures", label: "Futures & perps" },
    { href: "/options", label: "Options" },
  ] },
  { title: "On-chain", links: [
    { href: "/dex", label: "DEXs" },
    { href: "/bridges", label: "Bridges" },
    { href: "/lending", label: "Lending" },
    { href: "/restaking", label: "Restaking" },
  ] },
  { title: "Money rails", links: [
    { href: "/on-ramps", label: "On/off-ramps" },
    { href: "/stablecoins", label: "Stablecoins" },
    { href: "/payments", label: "Payments" },
    { href: "/savings", label: "Savings & earn" },
  ] },
  { title: "Start", links: [
    { href: "/start", label: "How to start" },
    { href: "/jobs", label: "Jobs" },
    { href: "/finder", label: "Finder" },
    { href: "/faq", label: "FAQ" },
  ] },
];

export default function Page() {
  const schema = webPageJsonLd({ name: "TopPick topics", description: "Editorial topic map.", path: "/topics" });
  const list = itemListJsonLd(CLUSTERS.map((cluster) => ({ name: cluster.title, url: `${SITE_URL}${cluster.links[0].href}` })));
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Topics", url: `${SITE_URL}/topics` },
  ]);
  return (
    <main className="tp-start-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="shell page-hero">
        <span>Topics</span>
        <h1>A map of questions, not headlines.</h1>
        <p>Use this page to move from a topic into a niche, a guide or the glossary. Live prices are never simulated here.</p>
      </section>
      <div className="tp-start-grid">
        {CLUSTERS.map((cluster) => (
          <article key={cluster.title} className="tp-start-card">
            <b>{cluster.title}</b>
            <p className="tp-chapter-links">
              {cluster.links.map((link) => (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              ))}
            </p>
          </article>
        ))}
      </div>
      <section className="shell content-shell">
        <h2>Guides</h2>
        <p className="tp-chapter-links">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/learn/${guide.slug}`}>{guide.title}</Link>
          ))}
        </p>
        <h2>Glossary</h2>
        <p className="tp-chapter-links">
          {GLOSSARY.map((item) => (
            <Link key={item.slug} href="/glossary">{item.term}</Link>
          ))}
        </p>
      </section>
    </main>
  );
}
