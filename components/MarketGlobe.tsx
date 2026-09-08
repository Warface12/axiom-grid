"use client";

import { useLiveScene } from "@/lib/visual/live";
import Link from "next/link";
import { MARKET_POLICIES } from "@/lib/markets";

export function MarketGlobe({ showCopy = true }: { showCopy?: boolean }) {
  const { ref, live } = useLiveScene(0.15);
  const tags = MARKET_POLICIES.slice(0, 5);

  return (
    <section className={`tp-chapter tp-chapter--globe${showCopy ? "" : " is-embed"}`} aria-label="Markets">
      <div className="tp-chapter-inner">
        {showCopy ? (
          <header className="tp-chapter-copy">
            <p className="tp-kicker">Global market access</p>
            <h2>Your country is part of the product.</h2>
            <p className="tp-lead">Availability and promotional eligibility are stored separately. We never invent a live tape of market activity.</p>
          </header>
        ) : null}
        <div ref={ref} className={`tp-earth2${live ? " is-live" : ""}`}>
          <div className="tp-earth2-stage">
            <div className="tp-earth2-halo" aria-hidden="true" />
            <svg className="tp-earth2-arcs" viewBox="0 0 400 400" aria-hidden="true">
              <path d="M40 210 C 120 40, 280 40, 360 200" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M50 250 C 140 360, 270 350, 350 230" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M70 120 C 160 180, 250 90, 330 140" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            <div className="tp-earth2-ball" aria-hidden="true">
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
              <span className="tp-earth2-land" />
            </div>
          </div>
          <ul className="tp-earth2-tags">
            {tags.map((market) => (
              <li key={market.code}>
                <Link href={`/markets/${market.code.toLowerCase()}`}>
                  <small>{market.code}</small>
                  {market.name}
                </Link>
              </li>
            ))}
            <li><Link href="/markets"><small>ALL</small>Open markets</Link></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
