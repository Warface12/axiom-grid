"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, GitCompare } from "lucide-react";
import type { Platform } from "@/lib/types";

type Props = { platforms: Platform[]; initialIds?: string[] };

export function CompareClient({ platforms, initialIds = [] }: Props) {
  const [selected, setSelected] = useState<string[]>(initialIds.filter((id) => platforms.some((p) => (p.id || p.slug) === id)).slice(0, 4));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev));
  }

  const compareList = useMemo(
    () => platforms.filter((p) => selected.includes(p.id || p.slug)),
    [platforms, selected]
  );

  return (
    <>
      <div className="compare-picker-grid">
        {platforms.map((platform) => {
          const id = platform.id || platform.slug;
          return (
            <label key={id} className={`compare-picker-card ${selected.includes(id) ? "selected" : ""}`}>
              <div className="compare-select">
                <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
                <strong>{platform.name}</strong>
              </div>
              <p className="compare-meta">{platform.kind} · {platform.status}</p>
              <p className="compare-meta">{platform.short}</p>
            </label>
          );
        })}
      </div>

      {selected.length >= 2 ? (
        <div className="compare-bar">
          <span><GitCompare size={15} />{selected.length} selected</span>
          <Link className="primary-btn" href={`/compare?ids=${selected.join(",")}`}>Share this comparison</Link>
        </div>
      ) : platforms.length ? (
        <p className="compare-hint">Select two to four public profiles to compare product type, custody, fees and research notes.</p>
      ) : null}

      {compareList.length >= 2 ? (
        <div className="compare-table-wrap premium-compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                {compareList.map((p) => (
                  <th key={p.slug}><Link href={`/${p.kind}s/${p.slug}`}>{p.name}</Link></th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Product type" values={compareList.map((p) => p.kind)} />
              <CompareRow label="Research status" values={compareList.map((p) => p.status)} />
              <CompareRow label="Custody" values={compareList.map((p) => p.custody || "Verify with provider")} />
              <CompareRow label="Fees" values={compareList.map((p) => p.feeSummary || "Not published")} />
              <CompareRow label="Security" values={compareList.map((p) => p.securitySummary || "Not published")} />
              <CompareRow label="Regulatory context" values={compareList.map((p) => p.regulatorySummary || "Not published")} />
              <CompareRow label="Highlights" values={compareList.map((p) => p.pros?.slice(0, 3).join("; ") || "—")} />
              <CompareRow label="Points to consider" values={compareList.map((p) => p.cons?.slice(0, 3).join("; ") || "—")} />
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td>{label}</td>
      {values.map((v, i) => (
        <td key={i}>{v === "Yes" ? <span className="compare-yes"><Check size={12} />Yes</span> : v}</td>
      ))}
    </tr>
  );
}
