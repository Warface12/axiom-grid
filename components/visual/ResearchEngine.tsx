import Link from "next/link";

const STAGES = [
  { n: "01", t: "Sources", d: "Operator pages, filings and docs — with URLs. Unsourced claims stay out." },
  { n: "02", t: "Verification", d: "Identity, product class and freshness. Imported is not verified." },
  { n: "03", t: "Comparison", d: "Like with like. Missing cells stay empty instead of guessed." },
  { n: "04", t: "Findings", d: "What is known, what is not, and what your market changes." },
];

export function ResearchEngine() {
  return (
    <section className="tp-chapter tp-chapter--engine" aria-label="Research engine">
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">Research intelligence</p>
          <h2>Sources in. Guesswork out.</h2>
          <p className="tp-lead">TopPick is a research desk, not a scoreboard. The pipeline is visible so a gap never looks like a rating.</p>
        </header>
        <ol className="tp-engine">
          {STAGES.map((stage, index) => (
            <li key={stage.n} style={{ ["--i" as string]: String(index) }}>
              <span>{stage.n}</span>
              <b>{stage.t}</b>
              <p>{stage.d}</p>
              {index < STAGES.length - 1 ? <i className="tp-engine-beam" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
        <p className="tp-chapter-links">
          <Link href="/research">Open the research desk</Link>
          <Link href="/how-we-rate">How we rate</Link>
        </p>
      </div>
    </section>
  );
}
