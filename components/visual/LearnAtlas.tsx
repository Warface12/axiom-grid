import Link from "next/link";
import { guides } from "@/lib/guides";

const PATHS = [
  { t: "Custody", href: "/learn/self-custody-basics", d: "Who can move the asset, and what recovery actually means." },
  { t: "Fees", href: "/learn/crypto-fees-explained", d: "Maker/taker is a start. Spread and withdrawals can dominate." },
  { t: "Venues", href: "/learn/broker-vs-exchange", d: "Brokers, exchanges and DEXs are different products." },
  { t: "Wallets", href: "/learn/exchange-vs-wallet", d: "Convenience versus key control. Neither is universally safer." },
];

export function LearnAtlas() {
  return (
    <section className="tp-chapter tp-chapter--learn" aria-label="Learn">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Learn</p>
          <h2>Understand the product before you use it.</h2>
          <p className="tp-lead">Guides are educational, not personal advice. They explain classes and risks, not which company to pick.</p>
        </header>
        <div className="tp-atlas">
          {PATHS.map((path) => (
            <Link key={path.t} href={path.href} className="tp-atlas-node">
              <b>{path.t}</b>
              <span>{path.d}</span>
            </Link>
          ))}
        </div>
        <div className="tp-atlas-guides">
          {guides.slice(0, 4).map((guide) => (
            <Link key={guide.slug} href={`/learn/${guide.slug}`} className="tp-edu-card">
              <small>{guide.category} · {guide.readTime}</small>
              <b>{guide.title}</b>
              <span>{guide.excerpt}</span>
            </Link>
          ))}
        </div>
        <p className="tp-chapter-links">
          <Link href="/learn">All guides</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/topics">Topics</Link>
          <Link href="/methodology">Methodology</Link>
        </p>
      </div>
    </section>
  );
}
