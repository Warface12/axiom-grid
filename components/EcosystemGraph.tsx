"use client";

import Link from "next/link";
import { useState } from "react";

const nodes = [
  { id: "exchanges", href: "/exchanges", title: "Exchanges", copy: "Spot, derivatives and funding — compared as market-access products." },
  { id: "brokers", href: "/brokers", title: "Brokers", copy: "Multi-asset and CFD brokers stay in their own legal lane." },
  { id: "wallets", href: "/wallets", title: "Wallets", copy: "Who holds the keys, how recovery works, which chains are stated." },
  { id: "dex", href: "/dex", title: "DEXs", copy: "On-chain venues without pretending they are the same as a CEX." },
  { id: "defi", href: "/defi", title: "DeFi", copy: "Protocols researched as products, not slogans." },
      { id: "tools", href: "/tools", title: "Tools", copy: "Analytics, tax, cards and more — finder first, directory second." },
  { id: "markets", href: "/markets", title: "Markets", copy: "Availability and promotion are separate questions." },
  { id: "opportunities", href: "/opportunities", title: "Opportunities", copy: "Cash, crypto, credit and points are never treated as the same thing." },
];

export function EcosystemGraph() {
  const [active, setActive] = useState(nodes[0].id);
  const current = nodes.find((n) => n.id === active) || nodes[0];
  return (
    <section className="tp-eco" aria-label="TopPick product map">
      <div className="tp-eco-copy">
        <span className="ag-section-marker">THE CRYPTO ECOSYSTEM</span>
        <h2>One map. Separate product classes.</h2>
        <p>TopPick connects exchanges, brokers, wallets, DEXs, DeFi and tools so you can compare like with like — without invented rankings.</p>
      </div>
      <div className="tp-eco-stage">
        <div className="tp-eco-core" aria-hidden="true">
          <b>TopPick</b>
          <small>Research</small>
        </div>
        <div className="tp-eco-nodes">
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={node.id === active ? "is-active" : ""}
              onClick={() => setActive(node.id)}
              aria-pressed={node.id === active}
            >
              {node.title}
            </button>
          ))}
        </div>
        <div className="tp-eco-detail">
          <p>{current.copy}</p>
          <Link href={current.href}>Open {current.title}</Link>
        </div>
      </div>
    </section>
  );
}
