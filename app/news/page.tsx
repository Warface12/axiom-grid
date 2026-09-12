import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getPublicPartnerPosts } from "@/lib/partnerPosts";

export async function generateMetadata() {
  const posts = await getPublicPartnerPosts(1);
  return buildMetadata({
    title: "News — TopPick.pro",
    description: "Sourced platform updates only. TopPick does not generate fictional crypto news.",
    path: "/news",
    noIndex: posts.length === 0,
  });
}

export default async function Page() {
  const posts = await getPublicPartnerPosts(30);
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>News</span>
        <h1>No invented headlines.</h1>
        <p>Headlines here are sourced platform updates — not a simulated news desk.</p>
      </section>
      <section className="shell content-shell">
        {posts.length ? posts.map((p) => (
          <article className="tp-update-card" key={p.id}>
            <h2>{p.title}</h2>
            <p>{p.excerpt}</p>
            <Link href={`/updates/${p.slug}`}>Read sourced update <ArrowUpRight /></Link>
          </article>
        )) : (
          <div className="tp-empty-guide">
            <h2>Read the research first</h2>
            <p>When a sourced update is published, it will show here. Until then, the guides still explain custody, fees and product classes.</p>
            <div className="tp-continue">
              <Link href="/learn">Guides</Link>
              <Link href="/topics">Topics</Link>
              <Link href="/markets">Markets</Link>
              <Link href="/finder">Finder</Link>
              <Link href="/jobs">Jobs</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
