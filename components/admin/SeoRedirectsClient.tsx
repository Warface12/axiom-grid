"use client";

import { useEffect, useState } from "react";

type Row = { id: string; from_path: string; to_path: string; permanent: boolean };

export function SeoRedirectsClient() {
  const [items, setItems] = useState<Row[]>([]);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [permanent, setPermanent] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch("/api/admin/redirects", { cache: "no-store" });
    const j = await r.json();
    setItems(j.items || []);
    if (!j.ok) setMessage(j.error || "Could not load redirects.");
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setMessage("");
    const r = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from_path: fromPath, to_path: toPath, permanent }),
    });
    const j = await r.json();
    if (!j.ok) { setMessage(j.error || "Save failed"); return; }
    setFromPath(""); setToPath("");
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/redirects?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  return (
    <section className="admin-panel" style={{ marginTop: 24 }}>
      <h2>Redirects</h2>
      <p>Site-relative paths only. Applied by edge middleware when the table is available. Do not point at off-site URLs.</p>
      {message ? <p>{message}</p> : null}
      <div className="ax-form-grid" style={{ gridTemplateColumns: "1fr 1fr auto auto", gap: 8, margin: "12px 0" }}>
        <input value={fromPath} onChange={(e) => setFromPath(e.target.value)} placeholder="/old-path" aria-label="From path" />
        <input value={toPath} onChange={(e) => setToPath(e.target.value)} placeholder="/new-path" aria-label="To path" />
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} /> 301</label>
        <button type="button" className="primary-btn" onClick={save}>Save</button>
      </div>
      <div className="ax-inventory-grid">
        {items.length ? items.map((row) => (
          <div key={row.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: 12 }}>
            <span><code>{row.from_path}</code> → <code>{row.to_path}</code> {row.permanent ? "301" : "302"}</span>
            <button type="button" onClick={() => remove(row.id)}>Remove</button>
          </div>
        )) : <p>No redirects yet.</p>}
      </div>
    </section>
  );
}
