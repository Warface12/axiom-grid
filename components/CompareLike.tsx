import Link from "next/link";

export function CompareLike() {
  return (
    <section className="tp-compare-like">
      <div className="tp-section-head">
        <p>COMPARE</p>
        <h2>Like with like</h2>
        <p>Two products of the same class. Missing facts stay blank instead of guessed.</p>
        <Link className="tp-inline-link" href="/compare">Open compare</Link>
      </div>
      <div className="tp-compare-stage" aria-hidden="true">
        <div className="tp-compare-slab">
          <b>A</b>
          <span>Exchange</span>
          <span>Wallet</span>
          <span>Broker</span>
        </div>
        <svg className="tp-compare-join" viewBox="0 0 160 140">
          <path d="M8 28 C70 28, 90 70, 152 70" fill="none" stroke="#37d9ff" strokeWidth="1.6" />
          <path d="M8 70 H152" fill="none" stroke="#37d9ff" strokeWidth="1.6" opacity=".55" />
          <path d="M8 112 C70 112, 90 70, 152 70" fill="none" stroke="#37d9ff" strokeWidth="1.6" opacity=".7" />
          <circle cx="152" cy="70" r="5" fill="#37d9ff" />
        </svg>
        <div className="tp-compare-slab is-b">
          <b>B</b>
          <span>Exchange</span>
          <span>Wallet</span>
          <span>Broker</span>
        </div>
      </div>
    </section>
  );
}
