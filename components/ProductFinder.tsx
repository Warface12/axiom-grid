"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATALOG, type PlatformKind } from "@/lib/catalog";

const questions: { id: string; label: string; options: { label: string; kinds: PlatformKind[] }[] }[] = [
  {
    id: "job",
    label: "What are you trying to do?",
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
    id: "custody",
    label: "Who should hold the keys?",
    options: [
      { label: "The operator holds balances", kinds: ["exchange", "broker", "crypto-card", "onramp"] },
      { label: "I keep the keys", kinds: ["wallet", "dex", "defi", "staking", "explorer"] },
      { label: "Not sure yet", kinds: ["exchange", "wallet", "broker"] },
    ],
  },
  {
    id: "market",
    label: "Do you need fiat access in a specific market?",
    options: [
      { label: "Yes — country and fiat rails matter", kinds: ["exchange", "broker", "onramp", "crypto-card"] },
      { label: "Mostly on-chain", kinds: ["wallet", "dex", "defi", "staking", "explorer"] },
      { label: "Not sure", kinds: ["exchange", "wallet", "broker", "tool"] },
    ],
  },
];

export function ProductFinder() {
  const [answers, setAnswers] = useState([0, 2, 2]);
  const kinds = useMemo(() => {
    const scored = new Map<PlatformKind, number>();
    questions.forEach((q, qi) => {
      q.options[answers[qi]].kinds.forEach((kind) => scored.set(kind, (scored.get(kind) || 0) + 1));
    });
    return [...scored.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([kind]) => kind);
  }, [answers]);
  const matches = CATALOG.filter((c) => kinds.includes(c.id));

  return (
    <form className="tp-finder" onSubmit={(e) => e.preventDefault()}>
      <p>Answer a few questions. We route you to the matching product class — not a ranked company list.</p>
      {questions.map((q, qi) => (
        <fieldset key={q.id}>
          <legend>{q.label}</legend>
          {q.options.map((opt, oi) => (
            <label key={opt.label}>
              <input
                type="radio"
                name={q.id}
                checked={answers[qi] === oi}
                onChange={() => setAnswers((prev) => prev.map((value, index) => (index === qi ? oi : value)))}
              />
              {opt.label}
            </label>
          ))}
        </fieldset>
      ))}
      <div className="tp-tool-grid">
        {matches.map((cat) => (
          <Link key={cat.id} href={`/${cat.hub}`} className="tp-tool-card">
            <small>{cat.group}</small>
            <b>{cat.plural}</b>
            <p>{cat.summary}</p>
          </Link>
        ))}
      </div>
    </form>
  );
}
