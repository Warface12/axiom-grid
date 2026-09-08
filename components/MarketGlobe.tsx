"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MARKET_POLICIES } from "@/lib/markets";

export function MarketGlobe({ showCopy = true }: { showCopy?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const tags = MARKET_POLICIES.slice(0, 4);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    <section className="tp-globe" aria-label="Markets">
      {showCopy ? (
        <div className="tp-globe-copy">
          <span className="ag-section-marker">MARKETS</span>
          <h2>What changes in your country?</h2>
          <p>Product access and promotions depend on where you are. Start with your market, then compare.</p>
          <Link className="tp-inline-link" href="/markets">Open markets</Link>
        </div>
      ) : null}
      <div ref={rootRef} className={`tp-earth${live ? " is-live" : ""}`}>
        <div className="tp-earth-halo" aria-hidden="true" />
        <div className="tp-earth-ball" aria-hidden="true">
          <i className="tp-earth-ring r0" />
          <i className="tp-earth-ring r1" />
          <i className="tp-earth-ring r2" />
          <i className="tp-earth-ring r3" />
          <i className="tp-earth-ring r4" />
          <i className="tp-earth-ring r5" />
          <i className="tp-earth-ring lat a" />
          <i className="tp-earth-ring lat b" />
          <b className="tp-earth-dot d1" />
          <b className="tp-earth-dot d2" />
          <b className="tp-earth-dot d3" />
        </div>
        <ul className="tp-earth-tags">
          {tags.map((market) => (
            <li key={market.code}>
              <Link href={`/markets/${market.code.toLowerCase()}`}>
                <small>{market.code}</small>
                {market.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
