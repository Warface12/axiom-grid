"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Check, GitCompare, Star } from "lucide-react";

type CompareCasino = {
  id: string;
  name: string;
  slug: string;
  rating: number;
  welcome_bonus: string | null;
  no_deposit: boolean;
  free_spins: boolean;
  crypto: boolean;
  payment_methods: string[];
  license_info: string | null;
  country_codes: string[];
  min_deposit: string | null;
  payout_speed?: string | null;
  withdrawal_limits?: string | null;
  kyc_required?: boolean | null;
  live_chat?: boolean | null;
  mobile_app?: boolean | null;
};

type Props = { casinos: CompareCasino[] };

export function CompareClient({ casinos }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  }
  function goCompare() { router.push(`/compare?ids=${selected.join(",")}`); }
  const compareList = casinos.filter((c) => selected.includes(c.id));

  return <>
    <div className="compare-picker-grid">
      {casinos.map((casino) => <label key={casino.id} className={`compare-picker-card ${selected.includes(casino.id) ? "selected" : ""}`}>
        <div className="compare-select"><input type="checkbox" checked={selected.includes(casino.id)} onChange={() => toggle(casino.id)} /><strong>{casino.name}</strong></div>
        {Number(casino.rating) > 0 ? <span className="compare-rating"><Star size={12} fill="currentColor"/>{casino.rating}/10</span> : null}
        {casino.welcome_bonus ? <p className="compare-meta">{casino.welcome_bonus}</p> : null}
      </label>)}
    </div>

    {selected.length >= 2 ? <div className="compare-bar"><span><GitCompare size={15}/>{selected.length} selected</span><button className="primary-btn" onClick={goCompare}>Compare selected</button></div> : null}

    {compareList.length >= 2 ? <div className="compare-table-wrap premium-compare-wrap"><table className="compare-table"><thead><tr><th>Feature</th>{compareList.map((c) => <th key={c.id}><Link href={`/casinos/${c.slug}`}>{c.name}</Link></th>)}</tr></thead><tbody>
      <CompareRow label="Rating" values={compareList.map((c) => Number(c.rating) > 0 ? `${c.rating}/10` : "—")} />
      <CompareRow label="Welcome Bonus" values={compareList.map((c) => c.welcome_bonus || "—")} />
      <CompareRow label="No Deposit" values={compareList.map((c) => c.no_deposit ? "Yes" : "—")} />
      <CompareRow label="Free Spins" values={compareList.map((c) => c.free_spins ? "Yes" : "—")} />
      <CompareRow label="Minimum Deposit" values={compareList.map((c) => c.min_deposit || "—")} />
      <CompareRow label="Payout Speed" values={compareList.map((c) => c.payout_speed || "—")} />
      <CompareRow label="Withdrawal Limits" values={compareList.map((c) => c.withdrawal_limits || "—")} />
      <CompareRow label="Payment Methods" values={compareList.map((c) => c.payment_methods?.join(", ") || "—")} />
      <CompareRow label="License" values={compareList.map((c) => c.license_info || "—")} />
      <CompareRow label="KYC" values={compareList.map((c) => c.kyc_required === true ? "Required" : c.kyc_required === false ? "Varies / not always" : "—")} />
      <CompareRow label="Live Chat" values={compareList.map((c) => c.live_chat ? "Yes" : "—")} />
      <CompareRow label="Mobile App" values={compareList.map((c) => c.mobile_app ? "Yes" : "—")} />
      <CompareRow label="Crypto" values={compareList.map((c) => c.crypto ? "Yes" : "—")} />
      <CompareRow label="Countries" values={compareList.map((c) => c.country_codes?.join(", ") || "—")} />
    </tbody></table></div> : null}
  </>;
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return <tr><td>{label}</td>{values.map((v, i) => <td key={i}>{v === "Yes" ? <span className="compare-yes"><Check size={12}/>Yes</span> : v}</td>)}</tr>;
}
