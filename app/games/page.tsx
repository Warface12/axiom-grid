import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "TopPick games",
  description: "Original TopPick games are free, crypto-themed and isolated from research pages. No wagering and no cash rewards by default.",
  path: "/games",
  noIndex: true,
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>TOPPICK GAMES</span>
        <h1>Playable research, not a casino.</h1>
        <p>When a TopPick-made game ships, it loads only on this route. Normal pages never download game assets. There is no wagering and no token prize pool unless a future, disclosed sponsorship exists.</p>
      </section>
      <section className="shell content-shell">
        <div className="tp-state-card">
          <b>No TopPick game is live yet</b>
          <p>This is an architecture placeholder, not a hidden catalogue of invented titles.</p>
        </div>
      </section>
    </main>
  );
}
