"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  company_name: string;
  official_website: string;
  business_email: string;
  intent: string;
  status: string;
  verification_status: string;
  existing_platform_id?: string | null;
};

type Row = { id: string; status?: string; title?: string; name?: string; platform_id?: string };

export function AdminPartnersClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<Row[]>([]);
  const [campaigns, setCampaigns] = useState<Row[]>([]);
  const [claims, setClaims] = useState<Row[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch("/api/admin/partners", { cache: "no-store" });
    const j = await r.json();
    setApplications(j.applications || []);
    setOffers(j.offers || []);
    setCampaigns(j.campaigns || []);
    setClaims(j.claims || []);
    if (!j.ok) setMessage(j.error || "Could not load.");
  }
  useEffect(() => { load(); }, []);

  async function review(id: string, status: string, platformId?: string | null) {
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status, platform_id: platformId }),
    });
    await load();
  }

  async function act(action: string, id: string, status?: string) {
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, id, status }),
    });
    await load();
  }

  return (
    <>
      <section className="admin-panel">
        <h2>Partner applications</h2>
        <p>Zero applications is expected until a real company applies. Approval creates membership only when the business email already has a consumer account and a platform id is known.</p>
        {message ? <p>{message}</p> : null}
        {applications.map((row) => (
          <div key={row.id} style={{ display: "grid", gap: 6, padding: 12, borderBottom: "1px solid var(--tp-border)" }}>
            <b>{row.company_name}</b>
            <span>{row.business_email} · {row.intent} · {row.status} · {row.verification_status}</span>
            <span>{row.official_website}{row.existing_platform_id ? " · claim existing record" : ""}</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => review(row.id, "in_review")}>In review</button>
              <button type="button" className="primary-btn" onClick={() => review(row.id, "approved", row.existing_platform_id)}>Approve</button>
              <button type="button" onClick={() => review(row.id, "rejected")}>Reject</button>
            </div>
          </div>
        ))}
        {!applications.length ? <p>No applications in the queue.</p> : null}
      </section>
      <section className="admin-panel">
        <h2>Claims</h2>
        {claims.length ? claims.map((row) => <p key={row.id}>{row.id} · {row.status} · {row.platform_id}</p>) : <p>No claims.</p>}
      </section>
      <section className="admin-panel">
        <h2>Offers in review</h2>
        {(offers.filter((row) => row.status === "pending_review")).map((row) => (
          <div key={row.id} style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 8 }}>
            <span>{row.title} · {row.status}</span>
            <button type="button" onClick={() => act("review_offer", row.id, "active")}>Publish</button>
            <button type="button" onClick={() => act("review_offer", row.id, "rejected")}>Reject</button>
          </div>
        ))}
        {!offers.filter((row) => row.status === "pending_review").length ? <p>No offers waiting.</p> : null}
      </section>
      <section className="admin-panel">
        <h2>Campaigns in review</h2>
        {(campaigns.filter((row) => row.status === "pending_review")).map((row) => (
          <div key={row.id} style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 8 }}>
            <span>{row.name} · {row.status}</span>
            <button type="button" onClick={() => act("review_campaign", row.id, "active")}>Activate</button>
            <button type="button" onClick={() => act("approve_destination", row.id)}>Approve destination</button>
            <button type="button" onClick={() => act("review_campaign", row.id, "rejected")}>Reject</button>
          </div>
        ))}
        {!campaigns.filter((row) => row.status === "pending_review").length ? <p>No campaigns waiting.</p> : null}
      </section>
    </>
  );
}
