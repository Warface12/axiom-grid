import Link from "next/link";

const classes = [
  { name: "Cash", note: "Fiat paid out under stated conditions." },
  { name: "Crypto", note: "An asset transfer — not the same as cash." },
  { name: "Trading credit", note: "Buying power, often with expiry." },
  { name: "Token", note: "A distinct instrument, not a dollar." },
  { name: "Points", note: "Loyalty units that may not transfer." },
  { name: "NFT", note: "A collectible, not a cash equivalent." },
  { name: "Conditional", note: "Unlocked only if rules are met." },
  { name: "Unknown", note: "Unclassified until evidence exists." },
];

export function OpportunityTaxonomy() {
  return (
    <section className="tp-taxonomy">
      <div>
        <span className="ag-section-marker">OPPORTUNITIES</span>
        <h2>Rewards are not interchangeable.</h2>
        <p>TopPick classifies offers so cash, crypto, credit, points and unknown rewards never look like the same prize.</p>
        <Link className="tp-inline-link" href="/opportunities">See opportunities</Link>
      </div>
      <ul className="tp-taxonomy-grid">
        {classes.map((item) => (
          <li key={item.name}>
            <b>{item.name}</b>
            <span>{item.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
