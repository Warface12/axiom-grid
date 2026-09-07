import Link from "next/link";

export function MarketGlobe({ showCopy = true }: { showCopy?: boolean }) {
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
      <div className="tp-globe-visual" aria-hidden="true">
        <svg viewBox="0 0 320 220" className="tp-globe-svg">
          <defs>
            <radialGradient id="tpGlobeFill" cx="45%" cy="40%">
              <stop offset="0" stopColor="#37d9ff" stopOpacity=".35" />
              <stop offset="1" stopColor="#12324a" stopOpacity=".15" />
            </radialGradient>
          </defs>
          <ellipse cx="160" cy="110" rx="88" ry="88" fill="url(#tpGlobeFill)" stroke="currentColor" strokeOpacity=".35" />
          <ellipse cx="160" cy="110" rx="88" ry="34" fill="none" stroke="currentColor" strokeOpacity=".22" />
          <ellipse cx="160" cy="110" rx="40" ry="88" fill="none" stroke="currentColor" strokeOpacity=".18" />
          <path d="M72 110 C120 40, 200 40, 248 110 C200 180, 120 180, 72 110" fill="none" stroke="#37d9ff" strokeOpacity=".45" />
          <circle cx="118" cy="78" r="3.5" fill="#37d9ff" />
          <circle cx="198" cy="96" r="3" fill="#7cf0ff" />
          <circle cx="168" cy="148" r="2.5" fill="#37d9ff" />
        </svg>
      </div>
    </section>
  );
}
