"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AD_PLACEMENTS, CAMPAIGN_TYPES, OFFER_TYPES, PARTNER_ROLES, REWARD_CLASSES } from "@/lib/ecosystem";

const nav = ["Overview", "Company & products", "Campaigns", "Advertising", "Performance", "Affiliate", "Billing", "Team", "Settings"];

type Workspace = {
  platform?: { name?: string; kind?: string; official_url?: string; visible?: boolean } | null;
  commercial?: Record<string, string>;
  offers?: { id: string; title: string; status: string; offer_type?: string; reward_class?: string }[];
  campaigns?: { id: string; name: string; status: string; campaign_type?: string; destination_status?: string }[];
  invoices?: { id: string; status: string; kind?: string; amount_minor?: number; currency?: string }[];
  team?: { id: string; role: string; status: string }[];
  inventory?: { placement: string; slot_limit: number; exclusive: boolean; status: string }[];
  adProducts?: { id: string; name: string; pricing_model: string; amount_minor?: number | null; status: string }[];
  metrics?: { clicks?: string; conversions?: string };
};

export function PartnerPortalClient() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState<{ ok?: boolean; membership?: { role?: string }; workspace?: Workspace | null; memberships?: unknown[]; message?: string; error?: string } | null>(null);
  const [message, setMessage] = useState("");
  const [offer, setOffer] = useState({ title: "", offer_type: "welcome_offer", reward_class: "unknown", reward_value: "", eligibility: "", terms_url: "", official_source_url: "" });
  const [campaign, setCampaign] = useState({ name: "", campaign_type: "general_advertising", placements: ["homepage"], destination_url: "", geo_targets: "", creative_notes: "" });
  const [invite, setInvite] = useState({ email: "", role: "viewer" });

  async function load() {
    const r = await fetch("/api/partner/workspace", { cache: "no-store" });
    const j = await r.json();
    setData(j);
  }
  useEffect(() => { load(); }, []);

  async function post(payload: object) {
    setMessage("");
    const r = await fetch("/api/partner/workspace", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    setMessage(j.error || (j.ok ? "Submitted for TopPick review. Nothing is auto-published." : "Request failed."));
    await load();
  }

  const ws = data?.workspace;

  return (
    <div>
      <div className="tp-filter-bar" style={{ flexWrap: "wrap" }}>
        {nav.map((item) => (
          <button key={item} type="button" className="ag-icon-btn" style={{ width: "auto", padding: "0 12px" }} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {!data ? <p>Loading workspace…</p> : null}
      {data?.error ? <p>{data.error} <Link href="/account">Sign in</Link> · <Link href="/partners/apply">Apply</Link></p> : null}
      {data?.ok && !ws && !data.error ? (
        <div className="tp-state-card">
          <b>No company access yet</b>
          <p>{data.message}</p>
          <Link href="/partners/apply">Apply for partner access</Link>
        </div>
      ) : null}

      {ws && tab === "Overview" ? (
        <div className="tp-tool-grid">
          <article className="tp-tool-card"><small>COMPANY</small><b>{ws.commercial?.company_relationship || "unclaimed"}</b><p>{ws.platform?.name || "Linked company"} · {ws.platform?.kind}</p></article>
          <article className="tp-tool-card"><small>AFFILIATE</small><b>{ws.commercial?.affiliate_relationship || "none"}</b><p>Separate from advertising. TopPick keeps approved affiliate destinations.</p></article>
          <article className="tp-tool-card"><small>ADVERTISING</small><b>{ws.commercial?.advertising_relationship || "none"}</b><p>Direct campaigns can run with no affiliate relationship.</p></article>
          <article className="tp-tool-card"><small>TRACKING</small><b>{ws.commercial?.direct_tracking || "not_connected"}</b><p>Clicks: {ws.metrics?.clicks}. Conversions: {ws.metrics?.conversions}.</p></article>
        </div>
      ) : null}

      {ws && tab === "Company & products" ? (
        <div className="tp-state-card">
          <b>{ws.platform?.name || "Company"}</b>
          <p>Official site: {ws.platform?.official_url || "Not stored"}. Public visibility is an editorial switch, not a partner toggle.</p>
          <p>Offers awaiting or published: {(ws.offers || []).length}. Submit a new offer below — it stays in review.</p>
          <form className="tp-finder" onSubmit={(e) => { e.preventDefault(); void post({ action: "create_offer", ...offer }); }}>
            <label>Offer title<input required value={offer.title} onChange={(e) => setOffer({ ...offer, title: e.target.value })} /></label>
            <label>Type<select value={offer.offer_type} onChange={(e) => setOffer({ ...offer, offer_type: e.target.value })}>{OFFER_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select></label>
            <label>Reward class<select value={offer.reward_class} onChange={(e) => setOffer({ ...offer, reward_class: e.target.value })}>{REWARD_CLASSES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select></label>
            <label>Reward as published<input value={offer.reward_value} onChange={(e) => setOffer({ ...offer, reward_value: e.target.value })} placeholder="Do not convert points into dollars" /></label>
            <label>Eligibility<textarea value={offer.eligibility} onChange={(e) => setOffer({ ...offer, eligibility: e.target.value })} /></label>
            <label>Terms URL<input type="url" value={offer.terms_url} onChange={(e) => setOffer({ ...offer, terms_url: e.target.value })} /></label>
            <label>Official source URL<input type="url" value={offer.official_source_url} onChange={(e) => setOffer({ ...offer, official_source_url: e.target.value })} /></label>
            <button className="primary-btn" type="submit">Submit offer for review</button>
          </form>
          <ul>{(ws.offers || []).map((row) => <li key={row.id}>{row.title} · {row.status} · {row.reward_class}</li>)}</ul>
        </div>
      ) : null}

      {ws && (tab === "Campaigns" || tab === "Advertising") ? (
        <div className="tp-state-card">
          <b>Campaign builder</b>
          <p>Inventory slots exist. Prices appear only after Admin stores an ad product. Payment is not marked complete from this form.</p>
          <form className="tp-finder" onSubmit={(e) => { e.preventDefault(); void post({ action: "create_campaign", ...campaign, placements: campaign.placements, geo_targets: campaign.geo_targets.split(",").map((s) => s.trim()).filter(Boolean) }); }}>
            <label>Campaign name<input required value={campaign.name} onChange={(e) => setCampaign({ ...campaign, name: e.target.value })} /></label>
            <label>What it promotes<select value={campaign.campaign_type} onChange={(e) => setCampaign({ ...campaign, campaign_type: e.target.value })}>{CAMPAIGN_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select></label>
            <label>Placement<select value={campaign.placements[0]} onChange={(e) => setCampaign({ ...campaign, placements: [e.target.value] })}>{AD_PLACEMENTS.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label>GEO codes<input value={campaign.geo_targets} onChange={(e) => setCampaign({ ...campaign, geo_targets: e.target.value })} placeholder="gb, ee, or leave blank" /></label>
            <label>Destination URL<input type="url" value={campaign.destination_url} onChange={(e) => setCampaign({ ...campaign, destination_url: e.target.value })} /></label>
            <label>Creative notes<textarea value={campaign.creative_notes} onChange={(e) => setCampaign({ ...campaign, creative_notes: e.target.value })} /></label>
            <button className="primary-btn" type="submit">Submit campaign for review</button>
          </form>
          <p>Open inventory: {(ws.inventory || []).map((row) => `${row.placement} (${row.slot_limit})`).join(" · ") || "Not loaded until migration is applied."}</p>
          <p>Priced products: {(ws.adProducts || []).length ? (ws.adProducts || []).map((p) => `${p.name} · ${p.pricing_model} · ${p.amount_minor == null ? "price unset" : "priced"}`).join(" · ") : "No prices stored. Owner action required."}</p>
          <ul>{(ws.campaigns || []).map((row) => <li key={row.id}>{row.name} · {row.status} · destination {row.destination_status || "n/a"}</li>)}</ul>
        </div>
      ) : null}

      {ws && tab === "Performance" ? (
        <div className="tp-tool-grid">
          <article className="tp-tool-card"><small>CLICKS</small><b>{ws.metrics?.clicks}</b><p>Recorded from TopPick routing.</p></article>
          <article className="tp-tool-card"><small>CONVERSIONS</small><b>{ws.metrics?.conversions}</b><p>Not tracked until an authorized postback is active.</p></article>
        </div>
      ) : null}

      {ws && tab === "Affiliate" ? (
        <div className="tp-state-card">
          <b>Affiliate relationship</b>
          <p>State: {ws.commercial?.affiliate_relationship}. Partners cannot overwrite TopPick’s approved affiliate URL. New destinations go through review.</p>
        </div>
      ) : null}

      {ws && tab === "Billing" ? (
        <div className="tp-state-card">
          <b>Advertising invoices</b>
          {(ws.invoices || []).length ? <ul>{ws.invoices!.map((row) => <li key={row.id}>{row.kind} · {row.status} · {row.currency}</li>)}</ul> : <p>No invoices. Advertising billing and affiliate statements stay on separate ledgers. Crypto payout addresses are never invented.</p>}
        </div>
      ) : null}

      {ws && tab === "Team" ? (
        <div className="tp-state-card">
          <b>Team</b>
          <ul>{(ws.team || []).map((row) => <li key={row.id}>{row.role} · {row.status}</li>)}</ul>
          <form className="tp-finder" onSubmit={(e) => { e.preventDefault(); void post({ action: "invite", ...invite }); }}>
            <label>Invite email<input type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} /></label>
            <label>Role<select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>{PARTNER_ROLES.map((role) => <option key={role} value={role}>{role.replace(/_/g, " ")}</option>)}</select></label>
            <button className="primary-btn" type="submit">Invite</button>
          </form>
        </div>
      ) : null}

      {ws && tab === "Settings" ? (
        <div className="tp-state-card">
          <b>Settings</b>
          <p>Your portal role: {data?.membership?.role}. Company verification and affiliate activation remain owner-controlled.</p>
        </div>
      ) : null}

      {message ? <p>{message}</p> : null}
    </div>
  );
}
