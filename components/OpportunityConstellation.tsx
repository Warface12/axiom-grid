"use client";

import { useState } from "react";
import Link from "next/link";

const NODES = [
  { id: "cash", label: "Cash", copy: "Fiat paid under conditions. Ask when it lands and what you must do first." },
  { id: "crypto", label: "Crypto", copy: "An asset with its own price risk. Not a cash equivalent." },
  { id: "credit", label: "Trading credit", copy: "Buying power that can expire or exclude withdrawals." },
  { id: "token", label: "Token", copy: "Its own instrument. Liquidity and unlocks matter." },
  { id: "points", label: "Points", copy: "Loyalty value that often cannot leave the product." },
  { id: "nft", label: "NFT", copy: "A collectible, not a deposit or a yield." },
  { id: "conditional", label: "Conditional", copy: "The reward exists only if you meet the terms." },
  { id: "unknown", label: "Unknown", copy: "If the prize is unclear, treat it as not comparable." },
];

export function OpportunityConstellation() {
  const [active, setActive] = useState(0);
  const current = NODES[active];
  return (
    <section className="tp-constellation" aria-label="Reward types">
      <div className="tp-constellation-sky" aria-hidden="true">
        <i className="tp-constellation-core" />
        {NODES.map((node, i) => (
          <button
            key={node.id}
            type="button"
            className={`tp-star${i === active ? " is-active" : ""}`}
            style={{ ["--i" as string]: String(i) }}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
          >
            {node.label}
          </button>
        ))}
      </div>
      <div className="tp-constellation-copy">
        <p>OPPORTUNITIES</p>
        <h2>{current.label}</h2>
        <p>{current.copy}</p>
        <Link className="tp-inline-link" href="/learn">How to read an offer</Link>
      </div>
    </section>
  );
}
