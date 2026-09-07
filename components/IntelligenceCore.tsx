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
    <div ref={rootRef} className={`tp-core${live ? " is-live" : ""}`}>
      <div className="tp-gyro-scene">
        <svg className="tp-gyro-net" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="168" fill="none" stroke="rgba(55,217,255,.18)" />
          <circle cx="200" cy="200" r="118" fill="none" stroke="rgba(55,217,255,.12)" />
          {BRANCHES.map((_, i) => {
            const a = ((i * 45 - 90) * Math.PI) / 180;
            const x = 200 + Math.cos(a) * 168;
            const y = 200 + Math.sin(a) * 168;
            return <line key={i} x1="200" y1="200" x2={x} y2={y} stroke="rgba(55,217,255,.16)" />;
          })}
        </svg>
        <div className="tp-gyro" aria-hidden="true">
          <div className="tp-gyro-inner">
            <i className="tp-gyro-glow" />
            <div className="tp-gyro-ring r1">
              {BRANCHES.slice(0, 4).map((b, i) => (
                <span key={b.id} className="tp-gyro-spoke" style={{ ["--a" as string]: String(i * 90) }}>
                  <i className={active === i ? "is-on" : ""} />
                </span>
              ))}
            </div>
            <div className="tp-gyro-ring r2">
              {BRANCHES.slice(4).map((b, i) => (
                <span key={b.id} className="tp-gyro-spoke" style={{ ["--a" as string]: String(i * 90 + 45) }}>
                  <i className={active === i + 4 ? "is-on" : ""} />
                </span>
              ))}
            </div>
            <div className="tp-gyro-ring r3" />
            <span className="tp-gyro-core" />
          </div>
        </div>
        {BRANCHES.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`tp-gyro-node${i === active ? " is-active" : ""}`}
            style={{ ["--a" as string]: String(i * 45) }}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
          >
            {b.label}
          </button>
        ))}
      </div>
      <p className="tp-core-copy">
        {current.copy}{" "}
        <Link href={current.href}>Explore {current.label}</Link>
      </p>
    </div>
  );
}
