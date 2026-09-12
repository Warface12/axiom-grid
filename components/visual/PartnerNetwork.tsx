import Link from "next/link";

const NODES = [
  { t: "Partner", d: "Verified company or authorized agency." },
  { t: "GEO", d: "Eligibility is stored per market, not inferred from a homepage." },
  { t: "Website", d: "Disclosed placements on TopPick.pro." },
  { t: "Email", d: "Only with consent and frequency limits." },
  { t: "App", d: "Installable surfaces when the user opted in." },
  { t: "Games", d: "Original TopPick games stay isolated from casino listings." },
];

export function PartnerNetwork() {
  return (
    <section className="tp-chapter tp-chapter--network" aria-label="Partner distribution">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Partner / business</p>
          <h2>Distribution without buying a review.</h2>
          <p className="tp-lead">A campaign can travel through website, email, app or games — only after GEO, consent and approval all pass.</p>
        </header>
        <div className="tp-net-graph" aria-hidden="true">
          <span className="tp-net-hub">Partner</span>
          {NODES.slice(1).map((node, index) => (
            <span key={node.t} className="tp-net-spoke" style={{ ["--a" as string]: String(index * 72) }}>{node.t}</span>
          ))}
        </div>
        <ol className="tp-network">
          {NODES.map((node, index) => (
            <li key={node.t} style={{ ["--i" as string]: String(index) }}>
              <b>{node.t}</b>
              <p>{node.d}</p>
            </li>
          ))}
        </ol>
        <p className="tp-chapter-links">
          <Link href="/partners">Partner with TopPick</Link>
          <Link href="/partners/apply">Apply</Link>
        </p>
      </div>
    </section>
  );
}
