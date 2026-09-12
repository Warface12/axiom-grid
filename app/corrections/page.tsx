import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Corrections — TopPick.pro",
  description: "How TopPick handles factual corrections on published research.",
  path: "/corrections",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Corrections</span>
        <h1>Send the source, not the slogan.</h1>
        <p>If a public profile, guide or market note is factually wrong, send the official source URL and the field that should change.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>What to include</b><p>The TopPick URL, the field, and a public official document. Partner-submitted changes still require review.</p></article>
        <article className="tp-start-card"><b>What we will not do</b><p>We do not silently rewrite published facts from marketing copy.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/contact">Contact</Link>
        <Link href="/editorial-policy">Editorial policy</Link>
        <Link href="/source-policy">Source policy</Link>
      </p>
    </main>
  );
}
