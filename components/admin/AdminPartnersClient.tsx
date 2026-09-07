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

export function AdminPartnersClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch("/api/admin/partners", { cache: "no-store" });
    const j = await r.json();
    setApplications(j.applications || []);
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

  return (
    <section className="admin-panel">
      <h2>Partner applications</h2>
      <p>Zero applications is expected until a real company applies. Do not seed samples.</p>
      {message ? <p>{message}</p> : null}
      {(applications.length ? applications : []).map((row) => (
        <div key={row.id} style={{ display: "grid", gap: 6, padding: 12, borderBottom: "1px solid var(--tp-border)" }}>
          <b>{row.company_name}</b>
          <span>{row.business_email} · {row.intent} · {row.status} · {row.verification_status}</span>
          <span>{row.official_website}{row.existing_platform_id ? " · claim existing record" : ""}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => review(row.id, "in_review")}>In review</button>
            <button type="button" className="primary-btn" onClick={() => review(row.id, "approved", row.existing_platform_id)}>Approve</button>
            <button type="button" onClick={() => review(row.id, "rejected")}>Reject</button>
          </div>
        </div>
      ))}
      {!applications.length ? <p>No applications in the queue.</p> : null}
    </section>
  );
}
