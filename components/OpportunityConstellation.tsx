"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveScene } from "@/lib/visual/live";

const NODES = [
  { id: "cash", label: "Cash", copy: "Fiat paid under conditions. Ask when it lands and what you must do first." },
  { id: "crypto", label: "Crypto", copy: "An asset with its own price risk. Not a cash equivalent." },
  { id: "token", label: "Token", copy: "Its own instrument. Liquidity and unlocks matter." },
  { id: "credit", label: "Trading credit", copy: "Buying power that can expire or exclude withdrawals." },
  { id: "nft", label: "NFT", copy: "A collectible, not a deposit or a yield." },
  { id: "points", label: "Points", copy: "Loyalty value that often cannot leave the product." },
  { id: "conditional", label: "Conditional", copy: "The reward exists only if you meet the terms." },
  { id: "unknown", label: "Unknown", copy: "If the prize is unclear, treat it as not comparable." },
];

export function OpportunityConstellation() {
  const { ref, live } = useLiveScene();
  const [active, setActive] = useState(0);
  const current = NODES[active];
  return (
    <section className="tp-chapter tp-chapter--reward" aria-label="Reward types">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Opportunities</p>
          <h2>Not every reward is money.</h2>
          <p className="tp-lead">Offers are sorted by how close the prize sits to spendable cash — and what you must do before it is yours. GEO eligibility is shown only when a market record exists.</p>
        </header>
        <div ref={ref} className={`tp-vault-room${live ? " is-live" : ""}`}>
          <div className="tp-vault-orbit" role="tablist" aria-label="Reward type">
            {NODES.map((node, i) => (
              <button
                key={node.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={`tp-crystal${i === active ? " is-active" : ""}`}
                style={{ ["--i" as string]: String(i) }}
                onClick={() => setActive(i)}
              >
                <span className="tp-crystal-body" aria-hidden="true" />
                <b>{node.label}</b>
              </button>
            ))}
          </div>
          <article className="tp-vault-detail">
            <h3>{current.label}</h3>
            <p>{current.copy}</p>
            <Link href="/opportunities">Open opportunities</Link>
            <Link href="/learn">How to read an offer</Link>
          </article>
        </div>
      </div>
    </section>
  );
}
