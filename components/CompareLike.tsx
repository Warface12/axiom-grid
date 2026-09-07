import Link from "next/link";

const pairs = [
  ["Exchange", "Exchange"],
  ["Wallet", "Wallet"],
  ["Broker", "Broker"],
  ["DEX", "DEX"],
];

export function CompareLike() {
  return (
    <section className="tp-compare-like">
      <div className="tp-section-head">
        <p>COMPARE</p>
        <h2>Like with like</h2>
        <p>Put two products of the same class next to each other. Gaps stay blank instead of guessed.</p>
        <Link className="tp-inline-link" href="/compare">Open compare</Link>
      </div>
      <div className="tp-compare-pairs" aria-hidden="true">
        {pairs.map(([a, b]) => (
          <div key={a} className="tp-pair">
            <span>{a}</span>
            <i />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
