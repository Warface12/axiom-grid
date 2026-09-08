"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const BRANCHES = [
  { id: "exchanges", label: "Exchanges", href: "/exchanges", x: "-132px", y: "-88px", z: "70px", copy: "Custodial venues where the operator holds your balance until you withdraw." },
  { id: "brokers", label: "Brokers", href: "/brokers", x: "18px", y: "-118px", z: "12px", copy: "Forex, CFD and multi-asset brokers read in their own class, not against exchanges." },
  { id: "wallets", label: "Wallets", href: "/wallets", x: "148px", y: "-76px", z: "48px", copy: "Software and hardware custody, judged on keys and recovery rather than branding." },
  { id: "dex", label: "DEXs", href: "/dex", x: "-148px", y: "8px", z: "-18px", copy: "On-chain venues with their own mechanics — not a decentralised copy of an exchange." },
  { id: "defi", label: "DeFi", href: "/defi", x: "8px", y: "6px", z: "92px", copy: "Protocols read as products, with mechanics separated from marketing language." },
  { id: "tools", label: "Tools", href: "/tools", x: "156px", y: "28px", z: "8px", copy: "Analytics, tax, cards and terminals sorted by the job you actually need done." },
  { id: "markets", label: "Markets", href: "/markets", x: "-96px", y: "108px", z: "36px", copy: "Your country changes access, fiat rails and what a promotion may even offer." },
  { id: "opportunities", label: "Opportunities", href: "/opportunities", x: "102px", y: "118px", z: "-12px", copy: "Cash, crypto, credit and points are different prizes with different conditions." },
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
    <div ref={rootRef} className={`tp-lattice${live ? " is-live" : ""}`}>
      <div className="tp-lattice-scene" aria-hidden={false}>
        <div className="tp-lattice-world">
          <div className="tp-lattice-floor" aria-hidden="true" />
          <span className="tp-lattice-mast" aria-hidden="true" />
          {BRANCHES.map((branch, i) => (
            <span
              key={branch.id}
              className="tp-lattice-slot"
              style={{ ["--x" as string]: branch.x, ["--y" as string]: branch.y, ["--z" as string]: branch.z }}
            >
              <button
                type="button"
                className={`tp-lattice-node${i === active ? " is-active" : ""}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                {branch.label}
              </button>
            </span>
          ))}
        </div>
      </div>
      <p className="tp-lattice-readout">
        <b>{current.label}</b>
        {current.copy}{" "}
        <Link href={current.href}>Open {current.label}</Link>
      </p>
    </div>
  );
}
