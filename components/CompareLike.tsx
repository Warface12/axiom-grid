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
      <div>
        <span className="ag-section-marker">COMPARE</span>
        <h2>Like with like. Nothing invented in the gaps.</h2>
        <p>Missing fields stay unpublished. Rankings are not generated to fill a table.</p>
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
