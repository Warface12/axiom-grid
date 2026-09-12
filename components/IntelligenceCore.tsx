"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiveScene, useParallax } from "@/lib/visual/live";
import { CategoryMark } from "@/components/visual/CategoryMark";

const BRANCHES = [
  { id: "exchange", label: "Exchanges", group: "Venues", href: "/exchanges", copy: "Custodial venues. The operator holds the balance until you withdraw." },
  { id: "wallet", label: "Wallets", group: "Custody", href: "/wallets", copy: "Who holds the keys, and how recovery is described." },
  { id: "futures", label: "Futures", group: "Venues", href: "/futures", copy: "Perps and dated futures. Funding stays empty unless sourced." },
  { id: "lending", label: "Lending", group: "On-chain", href: "/lending", copy: "Collateral and liquidation — not a headline APY." },
  { id: "bridge", label: "Bridges", group: "Infrastructure", href: "/bridges", copy: "In-flight custody is its own failure mode." },
  { id: "niches", label: "All niches", group: "Map", href: "/niches", copy: "Forty-plus researched classes. Empty directories stay empty." },
  { id: "markets", label: "Markets", group: "Access", href: "/markets", copy: "Your country changes access, rails and what can even be offered." },
  { id: "jobs", label: "Jobs", group: "Start", href: "/jobs", copy: "Start from the work, not from a brand wall." },
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
              <span className="tp-mod-3d">
                <span className="tp-mod-face">
                  <CategoryMark id={branch.id} />
                  <span>
                    <small>{branch.group}</small>
                    {branch.label}
                  </span>
                </span>
                <span className="tp-mod-side" aria-hidden="true" />
                <span className="tp-mod-lid" aria-hidden="true" />
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
