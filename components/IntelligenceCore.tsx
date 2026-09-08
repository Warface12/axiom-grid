"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiveScene, useParallax } from "@/lib/visual/live";
import { CategoryMark } from "@/components/visual/CategoryMark";

const BRANCHES = [
  { id: "exchange", label: "Exchanges", group: "Venues", href: "/exchanges", copy: "Custodial venues. The operator holds the balance until you withdraw." },
  { id: "broker", label: "Brokers", group: "Venues", href: "/brokers", copy: "Forex, CFD and multi-asset brokers — their own class, not an exchange." },
  { id: "dex", label: "DEXs", group: "Venues", href: "/dex", copy: "On-chain venues with their own mechanics, not a copy of a CEX." },
  { id: "wallet", label: "Wallets", group: "Custody", href: "/wallets", copy: "Who holds the keys, and how recovery is described." },
  { id: "defi", label: "DeFi", group: "On-chain", href: "/defi", copy: "Protocols as products. Mechanics first, marketing second." },
  { id: "tool", label: "Tools", group: "Jobs", href: "/tools", copy: "Analytics, tax, cards and terminals by the job you need done." },
  { id: "markets", label: "Markets", group: "Access", href: "/markets", copy: "Your country changes access, rails and what can even be offered." },
  { id: "opportunities", label: "Opportunities", group: "Rewards", href: "/opportunities", copy: "Cash, crypto, credit and points are different prizes." },
];

export function IntelligenceCore() {
  const { ref, live, tier } = useLiveScene(0.08);
  const parallaxRef = useParallax(true);
  const [active, setActive] = useState(0);
  const current = BRANCHES[active];
  const sparks = tier === "lite" ? 8 : tier === "balanced" ? 14 : 22;

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % BRANCHES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [live]);

  return (
    <div ref={ref} className={`tp-core-lab${live ? " is-live" : ""}`}>
      <div ref={parallaxRef} className="tp-core-space" aria-hidden="true">
        <div className="tp-core-depth">
          <span className="tp-core-grid" />
          <span className="tp-core-bloom" />
          <span className="tp-core-ring r-a" />
          <span className="tp-core-ring r-b" />
          <span className="tp-core-ring r-c" />
          <span className="tp-core-sun" />
          <span className="tp-core-scan" />
          {Array.from({ length: sparks }, (_, i) => (
            <i key={i} className="tp-core-spark" style={{ ["--i" as string]: String(i) }} />
          ))}
          {BRANCHES.map((branch, index) => (
            <button
              key={branch.id}
              type="button"
              className={`tp-core-mod${index === active ? " is-active" : ""}`}
              style={{ ["--i" as string]: String(index) }}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              <CategoryMark id={branch.id} />
              <span>
                <small>{branch.group}</small>
                {branch.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <article className="tp-core-readout">
        <p>{current.group}</p>
        <h2>{current.label}</h2>
        <p>{current.copy}</p>
        <Link href={current.href}>Open {current.label}</Link>
        <div className="tp-core-dots" role="tablist" aria-label="Intelligence modules">
          {BRANCHES.map((branch, index) => (
            <button
              key={branch.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={branch.label}
              className={index === active ? "is-active" : ""}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
