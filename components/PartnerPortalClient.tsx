"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const nav = ["Overview", "Company & products", "Campaigns", "Advertising", "Performance", "Affiliate", "Billing", "Settings"];

export function PartnerPortalClient() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState<{ ok?: boolean; memberships?: unknown[]; overview?: Record<string, unknown> | null; message?: string; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/partner/overview", { cache: "no-store" }).then((r) => r.json()).then(setData);
  }, []);

  return (
    <div>
      <div className="tp-filter-bar" style={{ flexWrap: "wrap" }}>
        {nav.map((item) => (
          <button key={item} type="button" className="ag-icon-btn" style={{ width: "auto", padding: "0 12px" }} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {!data ? <p>Loading workspace…</p> : null}
      {data?.error ? <p>{data.error} <Link href="/account">Sign in</Link> · <Link href="/partners/apply">Apply</Link></p> : null}
      {data?.ok && !data.memberships?.length ? (
        <div className="tp-state-card">
          <b>No company access yet</b>
          <p>{data.message || "Submit an application. Partner accounts are not consumer accounts."}</p>
          <Link href="/partners/apply">Apply for partner access</Link>
        </div>
      ) : null}
      {data?.overview && tab === "Overview" ? (
        <div className="tp-tool-grid">
          <article className="tp-tool-card"><small>COMPANY</small><b>{String(data.overview.companyRelationship)}</b><p>Claim / verification state. Not an editorial rating.</p></article>
          <article className="tp-tool-card"><small>AFFILIATE</small><b>{String(data.overview.affiliateRelationship)}</b><p>Separate from advertising. None is a valid production state.</p></article>
          <article className="tp-tool-card"><small>ADVERTISING</small><b>{String(data.overview.advertisingRelationship)}</b><p>Direct campaigns can exist with no affiliate URL.</p></article>
          <article className="tp-tool-card"><small>TRACKING</small><b>{String(data.overview.directTracking)}</b><p>Registrations: {String(data.overview.registrations)}. Clicks: {String(data.overview.clicks)}.</p></article>
        </div>
      ) : null}
      {tab !== "Overview" ? (
        <div className="tp-state-card" style={{ marginTop: 16 }}>
          <b>{tab}</b>
          <p>This section is ready for verified members. There is no sample campaign, invoice or conversion to display.</p>
          {tab === "Campaigns" ? <p>Wizard path: promote → placement → GEO → format → device → creative → destination → dates → price → preview → pay/review.</p> : null}
          {tab === "Performance" ? <p>Unconnected conversion types show Not tracked, never a fake zero.</p> : null}
          {tab === "Affiliate" ? <p>TopPick keeps approved affiliate destinations. Partners cannot silently overwrite owner attribution.</p> : null}
          {tab === "Billing" ? <p>Advertising invoices and affiliate statements are separate ledgers. Crypto payout addresses are never invented.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
