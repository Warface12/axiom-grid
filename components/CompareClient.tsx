"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GitCompare } from "lucide-react";
import type { Platform } from "@/lib/types";
import { catalogById, platformPath, unknownLabel } from "@/lib/catalog";
import { comparisonPath } from "@/lib/compareSlug";

type Props = { platforms: Platform[]; initialIds?: string[] };

function valueFor(platform: Platform, key: string) {
  const direct: Record<string, string | undefined | null> = {
    kind: catalogById(platform.kind)?.label || platform.kind,
    status: platform.status,
    custody: platform.custody,
    feeSummary: platform.feeSummary,
    securitySummary: platform.securitySummary,
    regulatorySummary: platform.regulatorySummary,
    productSummary: platform.productSummary,
    verification: platform.verificationStatus,
  };
  if (key in direct) return unknownLabel(direct[key]);
  const raw = platform.attributes?.[key];
  if (raw === true) return "Yes";
  if (raw === false) return "No";
  if (typeof raw === "string") return unknownLabel(raw);
  return "Not disclosed";
}

function rowLabel(kind: string, key: string) {
  if (key === "kind") return "Product type";
  if (key === "status") return "Research status";
  if (key === "custody") return "Custody";
  if (key === "feeSummary") return "Fees";
  if (key === "securitySummary") return "Security";
  if (key === "regulatorySummary") return "Regulatory context";
  if (key === "productSummary") return "Product notes";
  if (key === "verification") return "Data quality";
  return catalogById(kind)?.attributes.find((item) => item.key === key)?.label || key;
}

export function CompareClient({ platforms, initialIds = [] }: Props) {
  const [selected, setSelected] = useState<string[]>(initialIds.filter((id) => platforms.some((p) => (p.id || p.slug) === id)).slice(0, 4));
  const [kindFilter, setKindFilter] = useState("all");

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev));
  }

  const visible = platforms.filter((p) => kindFilter === "all" || p.kind === kindFilter);
  const compareList = useMemo(() => platforms.filter((p) => selected.includes(p.id || p.slug)), [platforms, selected]);
  const kinds = Array.from(new Set(compareList.map((p) => p.kind)));
  const keys = kinds.length === 1
    ? ["kind", "status", "verification", ...(catalogById(kinds[0])?.compareKeys || [])]
    : ["kind", "status", "verification", "custody", "feeSummary", "securitySummary"];

  return (
    <>
      <div className="tp-filter-bar">
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} aria-label="Filter comparison category">
          <option value="all">All published categories</option>
          {Array.from(new Set(platforms.map((p) => p.kind))).map((kind) => (
            <option key={kind} value={kind}>{catalogById(kind)?.plural || kind}</option>
          ))}
        </select>
      </div>
      <div className="compare-picker-grid">
        {visible.length ? visible.map((platform) => {
          const id = platform.id || platform.slug;
          return (
            <label key={id} className={`compare-picker-card ${selected.includes(id) ? "selected" : ""}`}>
              <div className="compare-select">
                <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
                <strong>{platform.name}</strong>
              </div>
              <p className="compare-meta">{catalogById(platform.kind)?.label || platform.kind} · {platform.status}</p>
              <p className="compare-meta">{platform.short || "No published summary."}</p>
            </label>
          );
        }) : <p className="compare-hint">No published profiles in that category yet.</p>}
      </div>

      {selected.length >= 2 ? (
        <div className="compare-bar">
          <span><GitCompare size={15} />{selected.length} selected</span>
          <Link className="primary-btn" href={comparisonPath(compareList.map((p) => p.slug))}>Share this comparison</Link>
        </div>
      ) : platforms.length ? (
        <p className="compare-hint">Select two to four published profiles. Missing cells stay “Not disclosed” instead of estimated.</p>
      ) : null}

      {compareList.length >= 2 ? (
        <div className="compare-table-wrap premium-compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                {compareList.map((p) => (
                  <th key={p.slug}><Link href={platformPath(p.kind, p.slug)}>{p.name}</Link></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key}>
                  <td>{rowLabel(compareList[0].kind, key)}</td>
                  {compareList.map((p) => <td key={p.slug}>{valueFor(p, key)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
