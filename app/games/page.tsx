import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "TopPick games",
  description: "Original TopPick games are free, crypto-themed and isolated from research pages. No wagering and no cash rewards by default.",
  path: "/games",
  noIndex: true,
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Games</span>
        <h1>Playable research, not a casino.</h1>
        <p>When a TopPick-made game ships, it loads only here. Research pages never download game assets.</p>
      </section>
      <section className="shell content-shell">
        <div className="tp-empty-guide">
          <h2>Nothing to play yet</h2>
          <p>This stays quiet until a real TopPick game is ready. No wagering, no token prize pool.</p>
          <div className="tp-continue">
            <Link href="/learn">Guides</Link>
            <Link href="/finder">Finder</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/apps">Install the app</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
