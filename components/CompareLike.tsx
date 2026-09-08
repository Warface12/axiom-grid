import Link from "next/link";

const ROWS = [
  { label: "Custody", a: "The operator holds your balance", b: "You hold the keys" },
  { label: "Access", a: "Account and market eligibility", b: "Networks the wallet supports" },
  { label: "Cost", a: "Trading and withdrawal fees", b: "Network fees you pay directly" },
  { label: "Recovery", a: "Account recovery by the operator", b: "Seed phrase or backup you keep" },
];

export function CompareLike() {
  return (
    <section className="tp-compare-like">
      <div className="tp-section-head">
        <p>COMPARE</p>
        <h2>Like with like</h2>
        <p>Two products of the same class, lined up on the same questions. Where a fact is not published, the row stays blank instead of guessed.</p>
        <Link className="tp-inline-link" href="/compare">Open compare</Link>
      </div>
      <div className="tp-compare-board">
        <div className="tp-compare-head" aria-hidden="true">
          <span>Question</span>
          <b>Exchange</b>
          <b>Wallet</b>
        </div>
        {ROWS.map((row) => (
          <div key={row.label} className="tp-compare-row">
            <span>{row.label}</span>
            <p>{row.a}</p>
            <p>{row.b}</p>
          </div>
        ))}
        <div className="tp-compare-row is-blank">
          <span>Unpublished detail</span>
          <p aria-label="Not published">—</p>
          <p aria-label="Not published">—</p>
        </div>
      </div>
    </section>
  );
}
