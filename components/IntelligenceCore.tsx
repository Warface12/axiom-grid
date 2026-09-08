"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const BRANCHES = [
  { id: "exchanges", label: "Exchanges", group: "Venues", href: "/exchanges", x: "-150px", y: "-112px", z: "64px", copy: "Custodial venues. The operator holds the balance until you withdraw." },
  { id: "brokers", label: "Brokers", group: "Venues", href: "/brokers", x: "8px", y: "-128px", z: "8px", copy: "Forex, CFD and multi-asset brokers — their own class, not an exchange." },
  { id: "dex", label: "DEXs", group: "Venues", href: "/dex", x: "156px", y: "-104px", z: "40px", copy: "On-chain venues with their own mechanics, not a copy of a CEX." },
  { id: "wallets", label: "Wallets", group: "Custody", href: "/wallets", x: "-128px", y: "-8px", z: "88px", copy: "Who holds the keys, and how recovery is described." },
  { id: "defi", label: "DeFi", group: "On-chain", href: "/defi", x: "24px", y: "6px", z: "28px", copy: "Protocols as products. Mechanics first, marketing second." },
  { id: "tools", label: "Tools", group: "Jobs", href: "/tools", x: "150px", y: "10px", z: "72px", copy: "Analytics, tax, cards and terminals by the job you need done." },
  { id: "markets", label: "Markets", group: "Access", href: "/markets", x: "-108px", y: "118px", z: "36px", copy: "Your country changes access, rails and what can even be offered." },
  { id: "opportunities", label: "Opportunities", group: "Rewards", href: "/opportunities", x: "118px", y: "124px", z: "-8px", copy: "Cash, crypto, credit and points are different prizes." },
];

export function IntelligenceCore() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const current = BRANCHES[active];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let shown = false;
    const sync = () => setLive(shown && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => {
      shown = entry.isIntersecting;
      sync();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={rootRef} className={`tp-chamber${live ? " is-live" : ""}`}>
      <div className="tp-chamber-scene">
        <div className="tp-chamber-world">
          <div className="tp-chamber-wall" aria-hidden="true" />
          <div className="tp-chamber-deck d0" aria-hidden="true" />
          <div className="tp-chamber-deck d1" aria-hidden="true" />
          <div className="tp-chamber-deck d2" aria-hidden="true" />
          <span className="tp-chamber-riser r-l" aria-hidden="true" />
          <span className="tp-chamber-riser r-r" aria-hidden="true" />
          <span className="tp-chamber-scan" aria-hidden="true" />
          {BRANCHES.map((branch, i) => (
            <span
              key={branch.id}
              className="tp-chamber-slot"
              style={{ ["--x" as string]: branch.x, ["--y" as string]: branch.y, ["--z" as string]: branch.z }}
            >
              <button
                type="button"
                className={`tp-tab${i === active ? " is-active" : ""}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <span className="tp-tab-face">
                  <small>{branch.group}</small>
                  {branch.label}
                </span>
                <span className="tp-tab-side" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      </div>
      <article className="tp-hud">
        <p>{current.group}</p>
        <h2>{current.label}</h2>
        <p>{current.copy}</p>
        <Link href={current.href}>Open {current.label}</Link>
      </article>
    </div>
  );
}
