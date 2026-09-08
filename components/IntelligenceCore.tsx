"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const BRANCHES = [
  {
    id: "exchanges",
    label: "Exchanges",
    group: "Trading venues",
    href: "/exchanges",
    copy: "Custodial venues where the operator holds your balance until you withdraw.",
    checks: ["Who holds the balance", "Spot, margin, derivatives scope", "Published fee model", "Country eligibility"],
  },
  {
    id: "brokers",
    label: "Brokers",
    group: "Trading venues",
    href: "/brokers",
    copy: "Forex, CFD and multi-asset brokers read in their own class, not against exchanges.",
    checks: ["Instrument coverage", "Stated regulatory entity", "Spread and commission model", "Retail protections by market"],
  },
  {
    id: "wallets",
    label: "Wallets",
    group: "Custody",
    href: "/wallets",
    copy: "Software and hardware custody, judged on keys and recovery rather than branding.",
    checks: ["Who controls the keys", "Recovery and backup model", "Supported networks", "Open-source claims"],
  },
  {
    id: "dex",
    label: "DEXs",
    group: "Trading venues",
    href: "/dex",
    copy: "On-chain venues with their own mechanics — not a decentralised copy of an exchange.",
    checks: ["Swap or order-book design", "Networks as published", "Custody model", "Aggregation behaviour"],
  },
  {
    id: "defi",
    label: "DeFi",
    group: "On-chain",
    href: "/defi",
    copy: "Protocols read as products, with mechanics separated from marketing language.",
    checks: ["What the protocol does", "Where the risk sits", "Lockups and exit terms", "Published audits"],
  },
  {
    id: "tools",
    label: "Tools",
    group: "Tools",
    href: "/tools",
    copy: "Analytics, tax, cards and terminals sorted by the job you actually need done.",
    checks: ["Job it solves", "Data it imports", "API and export", "Account requirements"],
  },
  {
    id: "markets",
    label: "Markets",
    group: "Markets",
    href: "/markets",
    copy: "Your country changes access, fiat rails and what a promotion may even offer.",
    checks: ["Availability by market", "Fiat rails", "Local restrictions", "Promotion eligibility"],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    group: "Opportunities",
    href: "/opportunities",
    copy: "Cash, crypto, credit and points are different prizes with different conditions.",
    checks: ["What the reward really is", "Conditions before payout", "Withdrawal limits", "Expiry terms"],
  },
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
    }, { threshold: 0.12 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={rootRef} className={`tp-desk${live ? " is-live" : ""}`}>
      <div className="tp-desk-rail" role="tablist" aria-label="Product classes">
        {BRANCHES.map((branch, i) => (
          <button
            key={branch.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={i === active ? "is-active" : ""}
            onClick={() => setActive(i)}
          >
            <span>{branch.label}</span>
            <em>{branch.group}</em>
          </button>
        ))}
      </div>
      <div className="tp-desk-stage">
        <span className="tp-desk-plate p3" aria-hidden="true" />
        <span className="tp-desk-plate p2" aria-hidden="true" />
        <article className="tp-desk-card">
          <p className="tp-desk-kicker">WHAT WE READ</p>
          <h2>{current.label}</h2>
          <p className="tp-desk-copy">{current.copy}</p>
          <ul className="tp-desk-checks">
            {current.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <Link className="tp-desk-cta" href={current.href}>Open {current.label}</Link>
        </article>
      </div>
    </div>
  );
}
