"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [active, setActive] = useState(0);
  const current = NODES[active];
  return (
    <section className="tp-rewards" aria-label="Reward types">
      <div className="tp-section-head">
        <p>OPPORTUNITIES</p>
        <h2>Not every reward is money</h2>
        <p>Offers are sorted by how close the prize sits to spendable cash — and what you must do before it is yours.</p>
      </div>
      <div className="tp-rewards-scale">
        <span className="tp-rewards-axis" aria-hidden="true" />
        <div className="tp-rewards-ends" aria-hidden="true">
          <span>Closest to cash</span>
          <span>Hardest to value</span>
        </div>
        <div className="tp-rewards-track" role="tablist" aria-label="Reward type">
          {NODES.map((node, i) => (
            <button
              key={node.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`tp-reward-stop${i === active ? " is-active" : ""}`}
              style={{ ["--i" as string]: String(i) }}
              onClick={() => setActive(i)}
            >
              <i aria-hidden="true" />
              <span>{node.label}</span>
            </button>
          ))}
        </div>
      </div>
      <article className="tp-rewards-detail">
        <h3>{current.label}</h3>
        <p>{current.copy}</p>
        <Link className="tp-inline-link" href="/learn">How to read an offer</Link>
      </article>
    </section>
  );
}
