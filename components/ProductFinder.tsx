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
      { label: "Buy or sell crypto on a venue", kinds: ["exchange", "dex", "onramp"] },
      { label: "Hold keys or use a device wallet", kinds: ["wallet"] },
      { label: "Use a broker for forex, CFDs or multi-asset", kinds: ["broker"] },
      { label: "Use DeFi, staking or on-chain apps", kinds: ["defi", "staking", "dex"] },
      { label: "Use charts, bots, tax or explorers", kinds: ["tool", "tax", "explorer", "trading-platform"] },
      { label: "Use cards or payment ramps", kinds: ["crypto-card", "onramp"] },
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
      { label: "Custody and who can move funds", kinds: ["wallet", "exchange"] },
      { label: "Market access and fiat rails", kinds: ["exchange", "broker", "onramp"] },
      { label: "On-chain mechanics", kinds: ["dex", "defi", "staking"] },
      { label: "Cost disclosures", kinds: ["exchange", "broker", "tax"] },
      { label: "Research tools and reporting", kinds: ["tool", "explorer", "tax"] },
    ],
  },
  {
    id: "custody",
    label: "Custody preference",
    hint: "Neither model is universally safer. They fail differently.",
    options: [
      { label: "The operator holds balances", kinds: ["exchange", "broker", "crypto-card", "onramp"] },
      { label: "I keep the keys", kinds: ["wallet", "dex", "defi", "staking", "explorer"] },
      { label: "Not sure yet", kinds: ["exchange", "wallet", "broker"] },
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
