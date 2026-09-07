export function MethodologyTrack() {
  const steps = [
    { n: "01", t: "Identify", d: "Legal entity, official domain, product class." },
    { n: "02", t: "Source", d: "Public pages, filings and operator docs — with URLs." },
    { n: "03", t: "Normalize", d: "Map facts onto the category schema. Leave gaps empty." },
    { n: "04", t: "Gate", d: "Market eligibility and affiliate CTAs stay separate." },
    { n: "05", t: "Publish", d: "Visible only after review. Imported is not verified." },
  ];
  return (
    <section className="tp-method-track" aria-label="Research path">
      <div className="ag-section-marker">RESEARCH PATH</div>
      <h2>How a platform becomes a public record</h2>
      <div className="tp-method-steps">
        {steps.map((s) => (
          <div key={s.n}><small>{s.n}</small><b>{s.t}</b><p>{s.d}</p></div>
        ))}
      </div>
    </section>
  );
}
