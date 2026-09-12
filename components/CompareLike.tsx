import Link from "next/link";

const ROWS = [
  { label: "Custody", a: "The operator holds your balance", b: "You hold the keys", delta: true },
  { label: "Access", a: "Account and market eligibility", b: "Networks the wallet supports", delta: true },
  { label: "Cost", a: "Trading and withdrawal fees", b: "Network fees you pay directly", delta: true },
  { label: "Recovery", a: "Account recovery by the operator", b: "Seed phrase or backup you keep", delta: true },
  { label: "Unpublished", a: "Not published", b: "Not published", delta: false },
];

export function CompareLike() {
  return (
    <section className="tp-chapter tp-chapter--lab">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Compare lab</p>
          <h2>Like with like. Gaps stay visible.</h2>
          <p className="tp-lead">Two products of the same class, lined up on the same questions. Where a fact is not published, the row stays blank instead of guessed.</p>
        </header>
        <div className="tp-lab">
          <div className="tp-lab-slabs" aria-hidden="true">
            <article className="tp-lab-slab s-a"><small>Class A</small><b>Exchange</b></article>
            <article className="tp-lab-slab s-b"><small>Class B</small><b>Wallet</b></article>
          </div>
          <div className="tp-lab-board">
            <div className="tp-lab-head">
              <span>Question</span>
              <b>Exchange</b>
              <b>Wallet</b>
            </div>
            {ROWS.map((row) => (
              <div key={row.label} className={`tp-lab-row${row.delta ? " is-delta" : " is-blank"}`}>
                <span>{row.label}</span>
                <p>{row.a}</p>
                <p>{row.b}</p>
              </div>
            ))}
          </div>
          <Link className="tp-lab-cta" href="/compare">Enter the comparison lab</Link>
        </div>
      </div>
    </section>
  );
}
