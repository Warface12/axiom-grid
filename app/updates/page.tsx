import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { getPublicPartnerPosts } from "@/lib/partnerPosts";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Platform & Partner Updates",
  description: "Sourced platform updates, product changes and promotional-term notices.",
  path: "/updates",
});

export default async function Page() {
  const posts = await getPublicPartnerPosts(30);
  return (
    <main>
      <section className="shell tp-hub-hero">
        <p>UPDATES</p>
        <h1>Platform changes, without the hype.</h1>
        <p>Source-linked notices about products, terms and market changes.</p>
      </section>
      <section className="shell content-shell">
        {posts.length ? (
          <div className="tp-update-grid">
            {posts.map((p) => (
              <article className="tp-update-card" key={p.id}>
                <div className="tp-update-meta">
                  <FileText />
                  <span>{p.postType.replaceAll("_", " ")}</span>
                  {p.platformName ? <b>{p.platformName}</b> : null}
                </div>
                <h2>{p.title}</h2>
                <p>{p.excerpt}</p>
                {p.bonusLabel ? <div className="tp-offer-label">Offer detail: {p.bonusLabel}</div> : null}
                <Link href={`/updates/${p.slug}`}>Read update <ArrowUpRight /></Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="tp-empty-guide">
            <h2>Guides still apply</h2>
            <p>Published product notices will appear here. Use the library while you wait for a sourced update.</p>
            <div className="tp-continue">
              <Link href="/learn">Guides</Link>
              <Link href="/markets">Markets</Link>
              <Link href="/how-we-rate">How we research</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
