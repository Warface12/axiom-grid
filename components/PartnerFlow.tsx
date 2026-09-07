import Link from "next/link";

const STEPS = [
  { n: "01", title: "Company", copy: "A verified legal entity — not a personal inbox." },
  { n: "02", title: "Product", copy: "The actual offering in a real product class." },
  { n: "03", title: "Offer", copy: "Optional promotion, classified by reward type." },
  { n: "04", title: "Campaign", copy: "Disclosed placement with a market and a date range." },
  { n: "05", title: "Distribution", copy: "TopPick surfaces it to people researching that class." },
  { n: "06", title: "Click", copy: "A recorded visit to an approved destination." },
  { n: "07", title: "Partner", copy: "The company workspace that owns the record." },
  { n: "08", title: "Conversion", copy: "Only after an authorized server event." },
  { n: "09", title: "Analytics", copy: "What happened — never invented as zero." },
];

export function PartnerFlow() {
  return (
    <ol className="tp-flow" aria-label="How partner distribution works">
      {STEPS.map((step, i) => (
        <li key={step.n}>
          <small>{step.n}</small>
          <b>{step.title}</b>
          <p>{step.copy}</p>
          {i < STEPS.length - 1 ? <span className="tp-flow-join" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

export function PartnerCtas() {
  return (
    <p className="tp-continue">
      <Link href="/partners/apply">Apply for partner access</Link>
      <Link href="/partner">Partner sign-in</Link>
      <Link href="/legal/affiliate-disclosure">How advertising is disclosed</Link>
    </p>
  );
}
