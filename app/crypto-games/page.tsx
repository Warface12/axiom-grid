import { buildMetadata } from "@/lib/seo";
import { countPublished } from "@/lib/publicInventory";
import Link from "next/link";

export async function generateMetadata() {
  const count = await countPublished("external_game");
  return buildMetadata({
    title: "Crypto games directory",
    description: "Third-party crypto and Web3 games submitted with official sources. Separate from TopPick’s own free games.",
    path: "/crypto-games",
    noIndex: count === 0,
  });
}

export default async function Page() {
  const count = await countPublished("external_game");
  return (
    <main>
      <section className="shell tp-hub-hero">
        <p>THIRD-PARTY GAMES</p>
        <h1>Sourced titles only — not a hidden catalogue.</h1>
        <p>This is not TopPick’s own games. Listed titles need an official site, terms and review.</p>
      </section>
      <section className="shell content-shell">
        {count ? (
          <p>{count} published titles</p>
        ) : (
          <div className="tp-empty-guide">
            <h2>No third-party games listed</h2>
            <p>Original TopPick games, when they ship, live on a separate route and never load here.</p>
            <div className="tp-continue">
              <Link href="/games">TopPick games</Link>
              <Link href="/learn">Guides</Link>
              <Link href="/opportunities">Opportunities</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
