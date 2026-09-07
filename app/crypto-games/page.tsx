import { buildMetadata } from "@/lib/seo";
import { countPublished } from "@/lib/publicInventory";

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
      <section className="shell page-hero">
        <span>THIRD-PARTY GAMES</span>
        <h1>Crypto games, sourced — not invented.</h1>
        <p>This directory is not TopPick’s own games. Partner-submitted titles need an official site, terms and review before they are indexed.</p>
      </section>
      <section className="shell content-shell">
        <div className="tp-state-card">
          <b>{count ? `${count} published games` : "No third-party games published"}</b>
          <p>Empty on purpose. TopPick original games live at /games and never load game bundles on this page.</p>
        </div>
      </section>
    </main>
  );
}
