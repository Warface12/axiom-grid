import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { MARKET_RULES, ACTIVE_MARKETS } from "@/lib/nivaro-core/markets";

export const dynamic = "force-dynamic";

export default async function MarketDashboardPage() {
  const supabase = await createSupabaseServiceClient();
  const rows: any[] = [];
  const syncs: any[] = [];
  if (supabase) {
    const { data } = await supabase.from("casino_market_compliance").select("casino_id,market_code,status,listing_allowed,affiliate_cta_allowed,bonus_public_advertising_allowed,evidence_confidence,last_checked_at,evidence_notes,casino:casino_id(name,slug)").order("market_code");
    rows.push(...(data || []));
    const { data: syncData } = await supabase.from("market_registry_sync").select("*").order("started_at", { ascending: false }).limit(12);
    syncs.push(...(syncData || []));
  }

  return <main className="admin-page-inner">
    <div className="admin-header"><div><h1>Market Compliance</h1><p>Exactly what is visible, hidden or review-gated in each supported market.</p></div></div>
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14,marginBottom:22}}>
      {ACTIVE_MARKETS.map((market) => {
        const marketRows = rows.filter((r) => r.market_code === market);
        const visible = marketRows.filter((r) => r.status === "approved" && r.listing_allowed).length;
        const hidden = marketRows.filter((r) => r.status === "blocked").length;
        const review = marketRows.filter((r) => r.status === "needs_legal_review" || r.status === "pending").length;
        const lastSync = syncs.find((r) => r.market_code === market);
        return <article className="admin-stat-card" key={market} style={{minHeight:180}}>
          <span>{MARKET_RULES[market].label}</span><strong>{visible} visible</strong>
          <div style={{display:"grid",gap:7,marginTop:12,fontSize:12,color:"#94a3b8"}}><div>Hidden: {hidden}</div><div>Needs review: {review}</div><div>Official registry: {lastSync?.status || "not synced"}</div><div>Last sync: {lastSync?.finished_at ? new Date(lastSync.finished_at).toLocaleString() : "Never"}</div></div>
        </article>;
      })}
    </section>

    <section className="admin-card" style={{padding:18,marginBottom:22}}>
      <h2 style={{marginTop:0}}>Fail-closed rule</h2>
      <p style={{color:"#94a3b8",lineHeight:1.7}}>No exact official registry match, stale evidence, unclear affiliate GEO permission or conflicting data means HIDDEN. A casino may exist in the master database without being public in any market.</p>
    </section>

    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Casino</th><th>Market</th><th>Status</th><th>Listing</th><th>Affiliate CTA</th><th>Bonuses</th><th>Confidence</th><th>Why</th></tr></thead><tbody>
      {rows.map((row) => <tr key={`${row.casino_id}-${row.market_code}`}><td>{row.casino?.name || row.casino_id}</td><td>{MARKET_RULES[row.market_code as keyof typeof MARKET_RULES]?.label || row.market_code}</td><td>{row.status}</td><td>{row.listing_allowed ? "SHOW" : "HIDE"}</td><td>{row.affiliate_cta_allowed ? "SHOW" : "HIDE"}</td><td>{row.bonus_public_advertising_allowed ? "SHOW" : "HIDE"}</td><td>{Number(row.evidence_confidence || 0).toFixed(0)}%</td><td style={{maxWidth:380,whiteSpace:"normal"}}>{row.evidence_notes || "—"}</td></tr>)}
      {!rows.length ? <tr><td colSpan={8}>No compliance rows yet. Run the Nivaro Core registry sync, then add/import casinos.</td></tr> : null}
    </tbody></table></div>
  </main>;
}
