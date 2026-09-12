"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATALOG, type PlatformKind } from "@/lib/catalog";
import { MARKET_POLICIES } from "@/lib/markets";
import { CategoryMark } from "@/components/visual/CategoryMark";

const STEPS: { id: string; label: string; hint: string; options: { label: string; kinds?: PlatformKind[]; note?: string }[] }[] = [
  {
    id: "job",
    label: "What are you looking for?",
    hint: "Start from the job, not from a brand list.",
    options: [
      { label: "Buy or sell crypto on a venue", kinds: ["exchange", "dex", "onramp", "p2p"] },
      { label: "Hold keys or use a device wallet", kinds: ["wallet", "custody"] },
      { label: "Use a broker for forex, CFDs or multi-asset", kinds: ["broker"] },
      { label: "Trade perps, futures or copy someone", kinds: ["futures", "copy-trading", "trading-platform"] },
      { label: "Use DeFi, staking, yield or DAOs", kinds: ["defi", "staking", "yield", "dao", "dex"] },
      { label: "Move value across chains or layers", kinds: ["bridge", "layer2", "oracle", "validator"] },
      { label: "Use cards, ramps, P2P or merchant payments", kinds: ["crypto-card", "onramp", "p2p", "payments", "stablecoin"] },
      { label: "Use charts, tax, identity or analytics", kinds: ["tool", "tax", "explorer", "analytics", "identity"] },
      { label: "Look at NFTs, launchpads, mining or cover", kinds: ["nft", "launchpad", "mining", "insurance"] },
      { label: "Institutional custody or a prime desk", kinds: ["custody", "institutional"] },
    ],
  },
  {
    id: "where",
    label: "Where are you researching from?",
    hint: "Your country changes access and what can be promoted. This does not geo-block research.",
    options: [
      ...MARKET_POLICIES.map((market) => ({ label: `${market.name} (${market.code})`, kinds: ["exchange", "broker", "onramp", "crypto-card"] as PlatformKind[] })),
      { label: "Mostly on-chain / not sure yet", kinds: ["wallet", "dex", "defi", "staking", "explorer"] },
    ],
  },
  {
    id: "priority",
    label: "What matters most?",
    hint: "We route by product class, not by a fake ranking.",
    options: [
      { label: "Custody and who can move funds", kinds: ["wallet", "exchange", "custody"] },
      { label: "Market access and fiat rails", kinds: ["exchange", "broker", "onramp", "payments", "p2p"] },
      { label: "On-chain mechanics", kinds: ["dex", "defi", "staking", "bridge", "layer2", "yield"] },
      { label: "Cost disclosures", kinds: ["exchange", "broker", "tax", "futures"] },
      { label: "Research tools and reporting", kinds: ["tool", "explorer", "tax", "analytics"] },
    ],
  },
  {
    id: "custody",
    label: "Custody preference",
    hint: "Neither model is universally safer. They fail differently.",
    options: [
      { label: "The operator holds balances", kinds: ["exchange", "broker", "crypto-card", "onramp", "custody", "copy-trading", "institutional"] },
      { label: "I keep the keys", kinds: ["wallet", "dex", "defi", "staking", "explorer", "bridge", "dao"] },
      { label: "Not sure yet", kinds: ["exchange", "wallet", "broker", "custody"] },
    ],
  },
];

export function ProductFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(STEPS.length).fill(-1));

  const kinds = useMemo(() => {
    const scored = new Map<PlatformKind, number>();
    STEPS.forEach((q, qi) => {
      const choice = answers[qi];
      if (choice < 0) return;
      q.options[choice].kinds?.forEach((kind) => scored.set(kind, (scored.get(kind) || 0) + 1));
    });
    return [...scored.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([kind]) => kind);
  }, [answers]);

  const matches = CATALOG.filter((c) => kinds.includes(c.id));
  const current = STEPS[step];
  const done = answers.every((value) => value >= 0);

  function pick(optionIndex: number) {
    setAnswers((prev) => prev.map((value, index) => (index === step ? optionIndex : value)));
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  return (
    <div className="tp-finder-app">
      <div className="tp-finder-progress" aria-hidden="true">
        {STEPS.map((item, index) => (
          <button key={item.id} type="button" className={index === step ? "is-on" : answers[index] >= 0 ? "is-done" : ""} onClick={() => setStep(index)}>
            <span>{index + 1}</span>
            {item.id}
          </button>
        ))}
      </div>
      <fieldset className="tp-finder-step">
        <legend>{current.label}</legend>
        <p>{current.hint}</p>
        {current.options.map((opt, oi) => (
          <label key={opt.label} className={answers[step] === oi ? "is-on" : ""}>
            <input
              type="radio"
              name={current.id}
              checked={answers[step] === oi}
              onChange={() => pick(oi)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </fieldset>
      <div className="tp-finder-nav">
        <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</button>
        <button type="button" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>Next</button>
      </div>
      {done ? (
        <div className="tp-finder-results">
          <h2>Matching product classes</h2>
          <p>These are classes, not ranked companies. Empty directories stay empty.</p>
          <div className="tp-finder-grid">
            {matches.map((cat) => (
              <Link key={cat.id} href={`/${cat.hub}`} className="tp-universe-tile">
                <CategoryMark id={cat.id} />
                <span>
                  <small>{cat.group}</small>
                  <b>{cat.plural}</b>
                  <em>{cat.summary}</em>
                </span>
              </Link>
            ))}
          </div>
          <p className="tp-chapter-links">
            <Link href="/markets">Check your market</Link>
            <Link href="/compare">Compare inside a class</Link>
          </p>
        </div>
      ) : (
        <p className="tp-finder-hint">Answer all four steps to see the matching classes.</p>
      )}
    </div>
  );
}
