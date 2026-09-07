"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const BRANCHES = [
  { id: "exchanges", label: "Exchanges", href: "/exchanges", copy: "Compare spot, derivatives and funding as market-access products." },
  { id: "brokers", label: "Brokers", href: "/brokers", copy: "Look at forex, CFDs and multi-asset brokers in their own class." },
  { id: "wallets", label: "Wallets", href: "/wallets", copy: "See who holds the keys and how recovery is described." },
  { id: "dex", label: "DEXs", href: "/dex", copy: "Research on-chain venues without treating them like a CEX." },
  { id: "defi", label: "DeFi", href: "/defi", copy: "Read protocols as products — not slogans or invented yields." },
  { id: "tools", label: "Tools", href: "/tools", copy: "Find analytics, tax, cards and terminals from the job you need done." },
  { id: "markets", label: "Markets", href: "/markets", copy: "Check what your country changes about access and promotions." },
  { id: "opportunities", label: "Opportunities", href: "/opportunities", copy: "Sort cash, crypto, credit and points — they are not the same prize." },
];

export function IntelligenceCore() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const current = BRANCHES[active];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let shown = false;
    const sync = () => setLive(shown && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => {
      shown = entry.isIntersecting;
      sync();
    }, { threshold: 0.15 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={rootRef} className={`tp-core${live ? " is-live" : ""}`}>
      <div className="tp-gyro" aria-hidden="true">
        <div className="tp-gyro-inner">
          <i className="tp-gyro-glow" />
          <div className="tp-gyro-ring r1">
            {BRANCHES.slice(0, 4).map((b, i) => (
              <span key={b.id} className={`tp-gyro-bead${active === i ? " is-on" : ""}`} style={{ ["--a" as string]: String(i * 90) }} />
            ))}
          </div>
          <div className="tp-gyro-ring r2">
            {BRANCHES.slice(4).map((b, i) => (
              <span key={b.id} className={`tp-gyro-bead${active === i + 4 ? " is-on" : ""}`} style={{ ["--a" as string]: String(i * 90 + 45) }} />
            ))}
          </div>
          <div className="tp-gyro-ring r3" />
          <span className="tp-gyro-core" />
        </div>
      </div>
      <div className="tp-core-panel">
        <div className="tp-core-map" role="tablist" aria-label="Product map">
          {BRANCHES.map((b, i) => (
            <button key={b.id} type="button" role="tab" aria-selected={i === active} className={i === active ? "is-active" : ""} onClick={() => setActive(i)}>
              {b.label}
            </button>
          ))}
        </div>
        <p>{current.copy}</p>
        <Link href={current.href}>Explore {current.label}</Link>
      </div>
    </div>
  );
}
