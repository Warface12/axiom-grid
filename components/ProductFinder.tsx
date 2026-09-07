"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATALOG, type PlatformKind } from "@/lib/catalog";

const questions: { id: string; label: string; options: { label: string; kinds: PlatformKind[] }[] }[] = [
  {
    id: "job",
    label: "What do you need to research?",
    options: [
      { label: "Buying or selling crypto on a venue", kinds: ["exchange", "dex", "onramp"] },
      { label: "Holding keys or a device wallet", kinds: ["wallet"] },
      { label: "Forex, CFDs or a broker account", kinds: ["broker"] },
      { label: "On-chain apps, staking or DeFi", kinds: ["defi", "staking", "dex"] },
      { label: "Charts, bots, tax or explorers", kinds: ["tool", "tax", "explorer", "trading-platform"] },
      { label: "Cards and payment ramps", kinds: ["crypto-card", "onramp"] },
    ],
  },
  {
    id: "custody",
    label: "Which custody model are you comparing?",
    options: [
      { label: "I want the operator to hold balances", kinds: ["exchange", "broker", "crypto-card", "onramp"] },
      { label: "I want to keep keys myself", kinds: ["wallet", "dex", "defi", "staking", "explorer"] },
      { label: "Not sure yet — show both research paths", kinds: ["exchange", "wallet", "broker"] },
    ],
  },
];

export function ProductFinder() {
  const [job, setJob] = useState(0);
  const [custody, setCustody] = useState(2);
  const kinds = useMemo(() => {
    const a = new Set(questions[0].options[job].kinds);
    return questions[1].options[custody].kinds.filter((k) => a.has(k)).concat(
      questions[1].options[custody].kinds.filter((k) => !a.has(k)).slice(0, 1),
    );
  }, [job, custody]);
  const matches = CATALOG.filter((c) => kinds.includes(c.id));

  return (
    <form className="tp-finder" onSubmit={(e) => e.preventDefault()}>
      <p><b>Product finder</b> — this maps your research question to a category. It does not recommend a company or invent a ranking.</p>
      {questions.map((q, qi) => (
        <fieldset key={q.id}>
          <legend>{q.label}</legend>
          {q.options.map((opt, oi) => (
            <label key={opt.label}>
              <input
                type="radio"
                name={q.id}
                checked={(qi === 0 ? job : custody) === oi}
                onChange={() => (qi === 0 ? setJob(oi) : setCustody(oi))}
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
