import Link from "next/link";

const classes = [
  { name: "Cash", note: "Fiat, with conditions." },
  { name: "Crypto", note: "An asset — not cash." },
  { name: "Credit", note: "Buying power that can expire." },
  { name: "Points", note: "Loyalty, often stuck." },
  { name: "Token", note: "Its own instrument." },
  { name: "NFT", note: "A collectible." },
];

export function OpportunityTaxonomy() {
  return (
    <section className="tp-taxonomy">
      <div className="tp-section-head">
        <p>OPPORTUNITIES</p>
        <h2>Rewards are not interchangeable</h2>
        <p>Cash, crypto, credit and points look similar in ads. They are not the same thing.</p>
        <Link className="tp-inline-link" href="/opportunities">See opportunities</Link>
      </div>
      <ul className="tp-chip-rail tp-tax-rail">
        {classes.map((item) => (
          <li key={item.name}><b>{item.name}</b> {item.note}</li>
        ))}
      </ul>
    </section>
  );
}
