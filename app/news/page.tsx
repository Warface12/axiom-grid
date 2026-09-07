import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
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
    <main>
      <section className="shell page-hero">
        <span>NEWS / SOURCED ONLY</span>
        <h1>No invented headlines.</h1>
        <p>Public news here is limited to sourced partner updates. If this list is empty, nothing has been published yet.</p>
      </section>
      <section className="shell content-shell">
        {posts.length ? posts.map((p) => (
          <article className="tp-update-card" key={p.id}>
            <h2>{p.title}</h2>
            <p>{p.excerpt}</p>
            <Link href={`/updates/${p.slug}`}>Read sourced update <ArrowUpRight /></Link>
          </article>
        )) : (
          <div className="ag-empty-directory">
            <div className="empty-index">
              <span><Newspaper /> NEWS DESK</span>
              <h2>No sourced news yet.</h2>
              <p>This route exists so the publishing workflow is ready. It will not be filled with simulated announcements.</p>
              <Link href="/learn">Open research library</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
