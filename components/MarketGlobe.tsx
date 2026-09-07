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
        <svg viewBox="0 0 320 240" className="tp-globe-svg">
          <defs>
            <radialGradient id="tpGlobeFill" cx="38%" cy="32%">
              <stop offset="0" stopColor="#7cf0ff" stopOpacity=".55" />
              <stop offset=".45" stopColor="#37d9ff" stopOpacity=".22" />
              <stop offset="1" stopColor="#08141e" stopOpacity=".1" />
            </radialGradient>
            <linearGradient id="tpGlobeShade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#37d9ff" stopOpacity=".0" />
              <stop offset="1" stopColor="#041018" stopOpacity=".45" />
            </linearGradient>
          </defs>
          <ellipse cx="160" cy="214" rx="78" ry="10" fill="#37d9ff" opacity=".12" />
          <circle cx="160" cy="118" r="86" fill="url(#tpGlobeFill)" />
          <circle cx="160" cy="118" r="86" fill="url(#tpGlobeShade)" />
          <ellipse cx="160" cy="118" rx="86" ry="28" fill="none" stroke="#37d9ff" strokeOpacity=".4" />
          <ellipse cx="160" cy="118" rx="86" ry="54" fill="none" stroke="#37d9ff" strokeOpacity=".22" />
          <ellipse cx="160" cy="118" rx="32" ry="86" fill="none" stroke="#9beeff" strokeOpacity=".28" />
          <ellipse cx="160" cy="118" rx="62" ry="86" fill="none" stroke="#37d9ff" strokeOpacity=".16" />
          <path d="M84 96 C128 70, 196 64, 236 92 C210 128, 150 148, 104 132 C92 118, 84 108, 84 96" fill="none" stroke="#37d9ff" strokeOpacity=".55" />
          <circle cx="118" cy="86" r="4" fill="#37d9ff" />
          <circle cx="198" cy="102" r="3.2" fill="#e7fbff" />
          <circle cx="168" cy="154" r="3" fill="#37d9ff" />
        </svg>
      </div>
    </section>
  );
}
