import Link from "next/link";
import { guides } from "@/lib/guides";

export function ReadingDesk() {
  const desk = guides.slice(-8);
  return (
    <section className="tp-chapter tp-chapter--desk" id="reading">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Tonight&apos;s reading</p>
          <h2>Read the class before you fund it.</h2>
          <p className="tp-lead">Guides stay educational. They do not rank companies or invent a live market.</p>
        </header>
        <div className="tp-desk-grid">
          {desk.map((guide) => (
            <Link key={guide.slug} href={`/learn/${guide.slug}`} className="tp-desk-card">
              <small>{guide.readTime}</small>
              <b>{guide.title}</b>
              <p>{guide.excerpt}</p>
            </Link>
          ))}
        </div>
        <p className="tp-chapter-links">
          <Link href="/learn">All guides</Link>
          <Link href="/topics">Topic map</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/methodology">Methodology</Link>
        </p>
      </div>
    </section>
  );
}
