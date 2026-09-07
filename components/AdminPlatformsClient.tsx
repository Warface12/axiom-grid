"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Link2, Plus, RefreshCw, Search, Trash2, WandSparkles, X } from "lucide-react";
import { CATALOG, catalogById, VERIFICATION_STATES } from "@/lib/catalog";

type Row = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  status: "research" | "verified" | "restricted";
  official_url?: string | null;
  affiliate_url?: string | null;
  affiliate_partner_id?: string | null;
  affiliate_campaign?: string | null;
  short_description?: string | null;
  logo_url?: string | null;
  og_image_url?: string | null;
  tags?: string[] | null;
  pros?: string[] | null;
  cons?: string[] | null;
  featured?: boolean;
  visible?: boolean;
  ranking_priority?: number;
  import_source_url?: string | null;
  import_retrieved_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

const blank = {
  name: "",
  slug: "",
  kind: "broker",
  status: "research",
  official_url: "",
  affiliate_url: "",
  affiliate_partner_id: "",
  affiliate_campaign: "",
  short_description: "",
  full_review: "",
  logo_url: "",
  og_image_url: "",
  custody_model: "",
  tags: "",
  fee_summary: "",
  security_summary: "",
  regulatory_summary: "",
  product_summary: "",
  pros: "",
  cons: "",
  seo_title: "",
  seo_description: "",
  featured: false,
  visible: false,
  ranking_priority: 0,
  import_source_url: "",
  import_retrieved_at: "",
  import_provenance: {},
  subcategory: "",
  attributes: {} as Record<string, string | boolean | null>,
  verification_status: "needs_review",
  last_verified_at: "",
  operator_name: "",
  founded_year: "",
  editorial_score: "",
  archived: false,
  cover_url: "",
  languages: "",
  screenshots: "",
  cta_label: "",
  risk_notes: "",
  source_notes: "",
};

const tabs = ["General", "Features", "Affiliate", "Review", "GEO / SEO", "Sources", "Publish"] as const;

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function inferName(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    const root = host.split(".")[0] || "";
    return root ? root.charAt(0).toUpperCase() + root.slice(1) : "";
  } catch {
    return "";
  }
}

export function AdminPlatformsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<(typeof tabs)[number]>("General");
  const [form, setForm] = useState<typeof blank & { id?: string }>(blank);
  const [dirty, setDirty] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importNotes, setImportNotes] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [quality, setQuality] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [sources, setSources] = useState<{ id: string; url: string; title?: string | null; source_type?: string }[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/platforms", { cache: "no-store" });
      const j = await r.json();
      setRows(j.items || []);
      if (!j.ok) setMessage(j.error || "Could not load platforms.");
    } catch {
      setMessage("Could not connect to the admin data service.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const filtered = useMemo(() => rows.filter((r) => {
    const hay = `${r.name} ${r.slug} ${r.kind} ${r.status}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (kindFilter !== "all" && r.kind !== kindFilter) return false;
    const v = String(r.verification_status || "needs_review");
    if (quality === "needs_review" && v !== "needs_review" && v !== "imported") return false;
    if (quality === "missing" && (r.short_description && r.official_url)) return false;
    if (quality === "stale" && v !== "stale") return false;
    if (quality === "imported" && v !== "imported") return false;
    if (quality === "hidden" && r.visible) return false;
    return true;
  }), [rows, query, kindFilter, quality]);

  function setField(patch: Record<string, unknown>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }

  function edit(row?: Row) {
    if (dirty && open && !confirm("Discard unsaved changes?")) return;
    setForm(row ? {
      ...blank,
      ...row,
      tags: (row.tags || []).join(", "),
      pros: (row.pros || []).join("\n"),
      cons: (row.cons || []).join("\n"),
      languages: Array.isArray(row.languages) ? row.languages.join(", ") : String(row.languages || ""),
      screenshots: Array.isArray(row.screenshots) ? row.screenshots.join("\n") : String(row.screenshots || ""),
      ranking_priority: Number(row.ranking_priority || 0),
      attributes: (row.attributes && typeof row.attributes === "object" ? row.attributes : {}) as Record<string, string | boolean | null>,
      verification_status: String(row.verification_status || "needs_review"),
      last_verified_at: String(row.last_verified_at || "").slice(0, 10),
      editorial_score: row.editorial_score == null ? "" : String(row.editorial_score),
      founded_year: row.founded_year == null ? "" : String(row.founded_year),
    } as typeof form : blank);
    setImportUrl(row?.official_url || row?.affiliate_url || "");
    setImportNotes([]);
    setDuplicates([]);
    setTab("General");
    setDirty(false);
    setOpen(true);
    setSources([]);
    if (row?.id) {
      fetch(`/api/admin/sources?platform_id=${encodeURIComponent(row.id)}`).then((r) => r.json()).then((j) => setSources(j.items || [])).catch(() => setSources([]));
    }
  }

  async function importFromUrl() {
    setImporting(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/platforms/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: importUrl || form.affiliate_url || form.official_url }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        setMessage(j.error || "Import could not retrieve public metadata.");
        return;
      }
      const f = j.imported?.fields || {};
      setField({
        name: form.name || f.name?.value || "",
        slug: form.slug || slugify(f.name?.value || inferName(j.imported?.finalUrl || "")),
        official_url: form.official_url || f.officialUrl?.value || "",
        short_description: form.short_description || f.shortDescription?.value || "",
        seo_title: form.seo_title || f.seoTitle?.value || "",
        seo_description: form.seo_description || f.seoDescription?.value || "",
        logo_url: form.logo_url || f.logoUrl?.value || "",
        og_image_url: form.og_image_url || f.ogImageUrl?.value || "",
        import_source_url: j.imported?.sourceUrl || "",
        import_retrieved_at: j.imported?.retrievedAt || "",
        import_provenance: j.imported || {},
        verification_status: "imported",
        visible: false,
        status: "research",
      });
      setDuplicates(j.duplicates || []);
      setImportNotes([
        j.message,
        j.imported?.suggestedKind?.kind ? `Suggested category (needs review): ${j.imported.suggestedKind.kind}` : "No category inferred. Choose it manually.",
        ...(j.imported?.needsReview || []),
        ...(j.imported?.missing?.length ? [`Missing public fields: ${j.imported.missing.join(", ")}`] : []),
      ].filter(Boolean));
    } finally {
      setImporting(false);
    }
  }

  async function uploadMedia(file: File, field: "logo_url" | "cover_url" | "og_image_url" | "screenshots") {
    const data = new FormData();
    data.append("file", file);
    const r = await fetch("/api/admin/media", { method: "POST", body: data });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      setMessage(j.error || "Upload failed.");
      return;
    }
    if (field === "screenshots") setField({ screenshots: `${form.screenshots || ""}\n${j.url}`.trim() });
    else setField({ [field]: j.url });
  }

  async function addSource() {
    if (!form.id) {
      setMessage("Save the platform first, then attach sources.");
      return;
    }
    const r = await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform_id: form.id, url: sourceUrl, title: sourceTitle, source_type: "official" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      setMessage(j.error || "Source could not be saved.");
      return;
    }
    setSourceUrl("");
    setSourceTitle("");
    setSources((prev) => [j.item, ...prev]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Saving partner…");
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      tags: String(form.tags || "").split(/[,\n]/).map((x) => x.trim()).filter(Boolean),
      pros: String(form.pros || "").split(/[,\n]/).map((x) => x.trim()).filter(Boolean),
      cons: String(form.cons || "").split(/[,\n]/).map((x) => x.trim()).filter(Boolean),
      languages: String(form.languages || "").split(/[,\n]/).map((x) => x.trim()).filter(Boolean),
      screenshots: String(form.screenshots || "").split(/[\n,]/).map((x) => x.trim()).filter(Boolean),
    };
    const r = await fetch("/api/admin/platforms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      setMessage(j.error || "Save failed.");
      return;
    }
    setOpen(false);
    setDirty(false);
    setMessage("Partner saved as a draft or published record according to the visibility toggle. Nothing is auto-published from URL import.");
    await load();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    const r = await fetch(`/api/admin/platforms?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      setMessage(j.error || "Delete failed.");
      return;
    }
    await load();
  }

  function duplicate(row: Row) {
    edit({
      ...row,
      id: undefined as unknown as string,
      name: `${row.name} copy`,
      slug: `${row.slug}-copy`,
      visible: false,
      featured: false,
      status: "research",
    });
  }

  const missing = [
    !form.name && "name",
    !form.kind && "type",
    !(form.official_url || form.affiliate_url) && "official or affiliate URL",
    !form.short_description && "short description",
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="ax-inventory-toolbar">
        <div className="ax-inventory-search">
          <Search />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inventory…" />
        </div>
        <button className="ax-tool-btn" onClick={load}><RefreshCw />Refresh</button>
        <select className="ax-tool-btn" value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} aria-label="Filter category">
          <option value="all">All categories</option>
          {CATALOG.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select className="ax-tool-btn" value={quality} onChange={(e) => setQuality(e.target.value)} aria-label="Filter data quality">
          <option value="all">All quality states</option>
          <option value="needs_review">Needs review / imported</option>
          <option value="imported">Imported</option>
          <option value="stale">Stale</option>
          <option value="missing">Missing core fields</option>
          <option value="hidden">Hidden</option>
        </select>
        <button className="ax-primary-btn" onClick={() => edit()}><Plus />Add platform</button>
      </div>
      {message && <div className="ax-admin-alert">{message}</div>}
      <div className="ax-inventory-grid">
        <div className="ax-inventory-head">
          <span>PLATFORM</span><span>TYPE</span><span>QUALITY</span><span>PUBLIC</span><span>UPDATED</span><span />
        </div>
        {loading ? (
          <div className="ax-inventory-empty">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="ax-inventory-empty">
            <b>No partner records yet.</b>
            <span>Add a platform manually or import public metadata from an official/affiliate URL. New records stay hidden until you publish them.</span>
          </div>
        ) : filtered.map((row) => (
          <div className="ax-inventory-row" key={row.id}>
            <button className="ax-platform-name" onClick={() => edit(row)}>
              <i>{row.name.slice(0, 2).toUpperCase()}</i>
              <span><b>{row.name}</b><small>{row.slug}</small></span>
            </button>
            <span className="ax-type-chip">{row.kind}</span>
            <span className={`ax-state-chip is-${row.status}`}>{String(row.verification_status || row.status)}</span>
            <span>{row.visible ? "Visible" : "Hidden"}</span>
            <span>{row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—"}</span>
            <span className="ax-row-actions">
              {row.official_url && <a href={row.official_url} target="_blank" rel="noreferrer" aria-label="Open official site"><ExternalLink /></a>}
              <button onClick={() => duplicate(row)} aria-label="Duplicate"><Copy /></button>
              <button onClick={() => remove(row.id, row.name)} aria-label="Delete"><Trash2 /></button>
            </span>
          </div>
        ))}
      </div>

      {open && (
        <div className="ax-modal-backdrop" onMouseDown={() => { if (!dirty || confirm("Discard unsaved changes?")) { setOpen(false); setDirty(false); } }}>
          <form className="ax-partner-modal toppick-partner-modal" onSubmit={save} onMouseDown={(e) => e.stopPropagation()}>
            <div className="ax-modal-head">
              <div>
                <span>PARTNER INTAKE</span>
                <h2>{form.id ? `Edit ${form.name}` : "Add partner"}</h2>
                <p>Paste an official or affiliate URL, collect public metadata, then review every field before publishing.</p>
              </div>
              <button type="button" onClick={() => { if (!dirty || confirm("Discard unsaved changes?")) { setOpen(false); setDirty(false); } }}><X /></button>
            </div>

            <section className="partner-essentials">
              <div className="partner-quick">
                <label>Official or affiliate URL
                  <input value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://…" />
                </label>
                <button type="button" className="ax-tool-btn" onClick={importFromUrl} disabled={importing}>
                  <Link2 />{importing ? "Fetching…" : "Import from URL"}
                </button>
                <button type="button" className="ax-tool-btn" onClick={() => setField({ name: form.name || inferName(importUrl || form.affiliate_url || form.official_url), slug: form.slug || slugify(form.name || inferName(importUrl)) })}>
                  <WandSparkles />Prefill name
                </button>
              </div>
              {importNotes.length > 0 && (
                <div className="partner-safety-note">
                  {importNotes.map((note) => <div key={note}>{note}</div>)}
                  {duplicates.map((dup) => <div key={dup.id}>Possible duplicate: {dup.name} ({dup.slug})</div>)}
                </div>
              )}
              {missing.length > 0 && <div className="partner-safety-note">Still needed before a complete record: {missing.join(", ")}.</div>}
            </section>

            <div className="tp-admin-tabs" role="tablist">
              {tabs.map((item) => (
                <button type="button" key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{item}</button>
              ))}
            </div>

            {tab === "General" && (
              <section className="ax-form-grid">
                <label>Name *<input required value={form.name || ""} onChange={(e) => setField({ name: e.target.value })} /></label>
                <label>Type
                  <select value={form.kind} onChange={(e) => setField({ kind: e.target.value, attributes: {} })}>
                    {CATALOG.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </label>
                <label>Subcategory
                  <select value={form.subcategory || ""} onChange={(e) => setField({ subcategory: e.target.value })}>
                    <option value="">Not set</option>
                    {(catalogById(form.kind)?.subcategories || []).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label>Slug<input value={form.slug || ""} onChange={(e) => setField({ slug: e.target.value })} placeholder="auto-from-name" /></label>
                <label>Status
                  <select value={form.status} onChange={(e) => setField({ status: e.target.value })}>
                    <option value="research">Research</option>
                    <option value="verified">Reviewed / eligible</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </label>
                <label className="wide">Official URL<input value={form.official_url || ""} onChange={(e) => setField({ official_url: e.target.value })} /></label>
                <label className="wide">Logo URL<input value={form.logo_url || ""} onChange={(e) => setField({ logo_url: e.target.value })} /></label>
                <label>Upload logo<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMedia(f, "logo_url"); }} /></label>
                <label className="wide">Cover image URL<input value={form.cover_url || ""} onChange={(e) => setField({ cover_url: e.target.value })} /></label>
                <label>Upload cover<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMedia(f, "cover_url"); }} /></label>
                <label className="wide">Screenshots<textarea value={form.screenshots || ""} onChange={(e) => setField({ screenshots: e.target.value })} placeholder="One image URL per line" /></label>
                <label>Upload screenshot<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMedia(f, "screenshots"); }} /></label>
                <label className="wide">Short description<textarea value={form.short_description || ""} onChange={(e) => setField({ short_description: e.target.value })} /></label>
                <label>Custody model<input value={form.custody_model || ""} onChange={(e) => setField({ custody_model: e.target.value })} /></label>
                <label>Ranking priority<input type="number" value={form.ranking_priority || 0} onChange={(e) => setField({ ranking_priority: Number(e.target.value) })} /></label>
                <label className="wide">Tags<input value={form.tags || ""} onChange={(e) => setField({ tags: e.target.value })} placeholder="forex, mt5, crypto" /></label>
              </section>
            )}

            {tab === "Features" && (
              <section className="ax-form-grid">
                <p className="wide partner-safety-note">Only fill fields you can source. Leave undisclosed features empty. Changing category resets these fields.</p>
                {(catalogById(form.kind)?.attributes || []).map((spec) => (
                  spec.type === "bool" ? (
                    <label key={spec.key}>{spec.label}
                      <select
                        value={form.attributes?.[spec.key] === true ? "yes" : form.attributes?.[spec.key] === false ? "no" : ""}
                        onChange={(e) => setField({ attributes: { ...form.attributes, [spec.key]: e.target.value === "" ? null : e.target.value === "yes" } })}
                      >
                        <option value="">Not disclosed</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                  ) : (
                    <label key={spec.key} className="wide">{spec.label}
                      <input
                        value={typeof form.attributes?.[spec.key] === "string" ? String(form.attributes[spec.key]) : ""}
                        onChange={(e) => setField({ attributes: { ...form.attributes, [spec.key]: e.target.value } })}
                      />
                    </label>
                  )
                ))}
                <label>Operator / company<input value={form.operator_name || ""} onChange={(e) => setField({ operator_name: e.target.value })} /></label>
                <label>Founded year<input value={form.founded_year || ""} onChange={(e) => setField({ founded_year: e.target.value })} /></label>
              </section>
            )}

            {tab === "Affiliate" && (
              <section className="ax-form-grid">
                <label className="wide">Default affiliate URL<input value={form.affiliate_url || ""} onChange={(e) => setField({ affiliate_url: e.target.value })} /></label>
                <label className="wide">CTA label<input value={form.cta_label || ""} onChange={(e) => setField({ cta_label: e.target.value })} placeholder="Leave empty until a real partner URL exists" /></label>
                <label>Partner / affiliate ID<input value={form.affiliate_partner_id || ""} onChange={(e) => setField({ affiliate_partner_id: e.target.value })} /></label>
                <label>Campaign / sub ID<input value={form.affiliate_campaign || ""} onChange={(e) => setField({ affiliate_campaign: e.target.value })} /></label>
                <p className="wide partner-safety-note">Market-specific affiliate URLs are managed under Admin → Markets. The public CTA stays fail-closed until a market rule allows promotion.</p>
              </section>
            )}

            {tab === "Review" && (
              <section className="ax-form-grid">
                <label className="wide">Products / account scope<textarea value={form.product_summary || ""} onChange={(e) => setField({ product_summary: e.target.value })} /></label>
                <label className="wide">Fees / spreads<textarea value={form.fee_summary || ""} onChange={(e) => setField({ fee_summary: e.target.value })} /></label>
                <label className="wide">Security / custody<textarea value={form.security_summary || ""} onChange={(e) => setField({ security_summary: e.target.value })} /></label>
                <label className="wide">Regulatory & market context<textarea value={form.regulatory_summary || ""} onChange={(e) => setField({ regulatory_summary: e.target.value })} /></label>
                <label className="wide">Full review<textarea className="tall" value={form.full_review || ""} onChange={(e) => setField({ full_review: e.target.value })} /></label>
                <label className="wide">Pros<textarea value={form.pros || ""} onChange={(e) => setField({ pros: e.target.value })} placeholder="One per line" /></label>
                <label className="wide">Points to consider<textarea value={form.cons || ""} onChange={(e) => setField({ cons: e.target.value })} placeholder="One per line" /></label>
                <label className="wide">Risk notes<textarea value={form.risk_notes || ""} onChange={(e) => setField({ risk_notes: e.target.value })} /></label>
              </section>
            )}

            {tab === "GEO / SEO" && (
              <section className="ax-form-grid">
                <label className="wide">SEO title<input value={form.seo_title || ""} onChange={(e) => setField({ seo_title: e.target.value })} /></label>
                <label className="wide">SEO description<textarea value={form.seo_description || ""} onChange={(e) => setField({ seo_description: e.target.value })} /></label>
                <label className="wide">OG image URL<input value={form.og_image_url || ""} onChange={(e) => setField({ og_image_url: e.target.value })} /></label>
                <label className="wide">Languages<input value={form.languages || ""} onChange={(e) => setField({ languages: e.target.value })} placeholder="en, es — only if sourced" /></label>
                <p className="wide partner-safety-note">GEO availability, blocked markets and legal notices are stored as market rules. Add them after saving this platform.</p>
              </section>
            )}

            {tab === "Sources" && (
              <section className="ax-form-grid">
                <p className="wide partner-safety-note">Attach official URLs for fees, GEO, licensing and product claims. Imported metadata is not a verified source.</p>
                <label className="wide">Source URL<input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} /></label>
                <label className="wide">Title<input value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} /></label>
                <button type="button" className="ax-tool-btn" onClick={addSource}>Add source</button>
                <div className="wide">
                  {sources.length ? sources.map((item) => (
                    <div key={item.id}><a href={item.url} target="_blank" rel="noreferrer">{item.title || item.url}</a></div>
                  )) : <span>No sources yet.</span>}
                </div>
              </section>
            )}

            {tab === "Publish" && (
              <section className="ax-form-grid">
                <label>Data quality
                  <select value={form.verification_status} onChange={(e) => setField({ verification_status: e.target.value })}>
                    {VERIFICATION_STATES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </label>
                <label>Last verified<input type="date" value={form.last_verified_at || ""} onChange={(e) => setField({ last_verified_at: e.target.value })} /></label>
                <label>Editorial score<input value={form.editorial_score || ""} onChange={(e) => setField({ editorial_score: e.target.value })} placeholder="Leave empty if not rated" /></label>
                <label className="wide">Source notes<textarea value={form.source_notes || ""} onChange={(e) => setField({ source_notes: e.target.value })} /></label>
                <div className="ax-toggle-row wide">
                  <label><input type="checkbox" checked={!!form.featured} onChange={(e) => setField({ featured: e.target.checked })} /> Featured near top</label>
                  <label><input type="checkbox" checked={!!form.visible} onChange={(e) => setField({ visible: e.target.checked })} /> Publicly visible</label>
                  <label><input type="checkbox" checked={!!form.archived} onChange={(e) => setField({ archived: e.target.checked, visible: e.target.checked ? false : form.visible })} /> Archived</label>
                </div>
                <div className="partner-safety-note wide">Imported is not verified. Publicly visible stays off until you choose to publish. Do not invent fees, GEO, licenses or affiliate URLs to complete the form.</div>
              </section>
            )}

            <div className="ax-modal-foot">
              <button type="button" className="ax-tool-btn" onClick={() => { if (!dirty || confirm("Discard unsaved changes?")) { setOpen(false); setDirty(false); } }}>Cancel</button>
              <button className="ax-primary-btn" type="submit">Save partner</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
