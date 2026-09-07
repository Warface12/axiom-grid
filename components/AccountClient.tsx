"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { INTEREST_LABELS } from "@/lib/interests";
import { USER_INTERESTS } from "@/lib/ecosystem";

type Desk = {
  user?: { email?: string } | null;
  items?: { id: string; item_type: string; item_id: string }[];
  follows?: { id: string; platform_id: string }[];
  notifications?: { id: string; title: string; body: string; href?: string | null; read_at?: string | null; created_at: string }[];
  preferences?: Record<string, boolean | string> | null;
  interests?: string[];
};

const emptyPrefs = {
  offers: false,
  rewards: false,
  learn: false,
  games: false,
  products: false,
  events: false,
  research: false,
  followed: false,
  digest: "weekly",
  marketing_opt_in: false,
};

export function AccountClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [oauth, setOauth] = useState({ google: false, apple: false });
  const [desk, setDesk] = useState<Desk | null>(null);
  const [tab, setTab] = useState("Overview");
  const [prefs, setPrefs] = useState(emptyPrefs);
  const [interests, setInterests] = useState<string[]>([]);

  async function refresh() {
    const r = await fetch("/api/account/me", { cache: "no-store" });
    const j = await r.json();
    setDesk(j);
    if (j.preferences) setPrefs({ ...emptyPrefs, ...j.preferences });
    if (Array.isArray(j.interests)) setInterests(j.interests);
  }

  useEffect(() => {
    fetch("/api/account/session").then((r) => r.json()).then((j) => setOauth(j.oauth || { google: false, apple: false }));
    refresh();
  }, []);

  async function auth() {
    setMessage("");
    const r = await fetch("/api/account/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, mode }),
    });
    const j = await r.json();
    if (!j.ok) { setMessage(j.error || "Could not sign in."); return; }
    setMessage(j.needsEmailConfirm ? "Check your email to confirm the account." : "Signed in.");
    await refresh();
  }

  async function post(payload: object, okMessage: string) {
    const r = await fetch("/api/account/me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    if (!j.ok) { setMessage(j.error || "Could not save."); return; }
    setMessage(okMessage);
    await refresh();
  }

  if (desk?.user?.email) {
    const unread = (desk.notifications || []).filter((n) => !n.read_at).length;
    const tabs = ["Overview", "Saved", "Following", "Opportunities", "Notifications", "Interests", "Email", "Settings"];
    return (
      <div className="tp-account-desk">
        <p className="tp-muted">Signed in as <b>{desk.user.email}</b>. This is a consumer account — it cannot administer a company page.</p>
        <div className="tp-filter-bar" style={{ flexWrap: "wrap" }}>
          {tabs.map((item) => (
            <button key={item} type="button" className="ag-icon-btn" style={{ width: "auto", padding: "0 12px" }} onClick={() => setTab(item)}>{item}{item === "Notifications" && unread ? ` (${unread})` : ""}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="tp-tool-grid">
            <article className="tp-tool-card"><small>SAVED</small><b>{desk.items?.length || 0}</b><p>Guides, comparisons and products you keep for later.</p></article>
            <article className="tp-tool-card"><small>FOLLOWING</small><b>{desk.follows?.length || 0}</b><p>Companies you follow. Updates appear only when a reviewed record exists.</p></article>
            <article className="tp-tool-card"><small>NOTIFICATIONS</small><b>{unread}</b><p>Unread in-product notices. Marketing email stays off unless you opt in.</p></article>
            <article className="tp-tool-card"><small>INTERESTS</small><b>{interests.length || "Optional"}</b><p>Used for For You filtering. Not required to keep an account.</p></article>
          </div>
        )}

        {tab === "Saved" && (
          <div className="tp-state-card">
            <b>Saved products, guides and comparisons</b>
            {(desk.items || []).length ? (
              <ul>{desk.items!.map((item) => <li key={item.id}>{item.item_type}: {item.item_id}</li>)}</ul>
            ) : <p>Nothing saved yet. When a profile, guide or comparison exists, use Save on that page.</p>}
          </div>
        )}

        {tab === "Following" && (
          <div className="tp-state-card">
            <b>Followed companies</b>
            {(desk.follows || []).length ? (
              <ul>{desk.follows!.map((item) => (
                <li key={item.id}>
                  {item.platform_id}
                  <button type="button" onClick={() => post({ unfollow: { platform_id: item.platform_id } }, "Unfollowed.")}>Unfollow</button>
                </li>
              ))}</ul>
            ) : <p>You are not following any published company yet.</p>}
          </div>
        )}

        {tab === "Opportunities" && (
          <div className="tp-state-card">
            <b>Opportunities</b>
            <p>Saved offers appear here after a reviewed opportunity exists and you save it. Empty is expected until then.</p>
            <Link href="/opportunities">Browse opportunities</Link>
          </div>
        )}

        {tab === "Notifications" && (
          <div className="tp-state-card">
            <b>Notification center</b>
            <button type="button" onClick={() => post({ mark_read: "all" }, "Marked as read.")}>Mark all read</button>
            {(desk.notifications || []).length ? (desk.notifications || []).map((n) => (
              <article key={n.id} className="tp-update-card">
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                {n.href ? <Link href={n.href}>Open</Link> : null}
              </article>
            )) : <p>No notifications. Campaigns are never emailed to every account automatically.</p>}
          </div>
        )}

        {tab === "Interests" && (
          <div className="tp-finder">
            <p>Optional. These help future For You, digest and app push routing.</p>
            {USER_INTERESTS.map((key) => (
              <label key={key}>
                <input type="checkbox" checked={interests.includes(key)} onChange={(e) => setInterests((prev) => e.target.checked ? [...prev, key] : prev.filter((x) => x !== key))} />
                {INTEREST_LABELS[key]}
              </label>
            ))}
            <button className="primary-btn" type="button" onClick={() => post({ interests }, "Interests saved.")}>Save interests</button>
          </div>
        )}

        {tab === "Email" && (
          <div className="tp-finder">
            <label><input type="checkbox" checked={Boolean(prefs.offers)} onChange={(e) => setPrefs({ ...prefs, offers: e.target.checked })} /> Offers & rewards</label>
            <label><input type="checkbox" checked={Boolean(prefs.learn)} onChange={(e) => setPrefs({ ...prefs, learn: e.target.checked })} /> Learn & earn</label>
            <label><input type="checkbox" checked={Boolean(prefs.games)} onChange={(e) => setPrefs({ ...prefs, games: e.target.checked })} /> Crypto games</label>
            <label><input type="checkbox" checked={Boolean(prefs.products)} onChange={(e) => setPrefs({ ...prefs, products: e.target.checked })} /> New products</label>
            <label><input type="checkbox" checked={Boolean(prefs.events)} onChange={(e) => setPrefs({ ...prefs, events: e.target.checked })} /> Events</label>
            <label><input type="checkbox" checked={Boolean(prefs.research)} onChange={(e) => setPrefs({ ...prefs, research: e.target.checked })} /> Research</label>
            <label><input type="checkbox" checked={Boolean(prefs.followed)} onChange={(e) => setPrefs({ ...prefs, followed: e.target.checked })} /> Companies I follow</label>
            <label><input type="checkbox" checked={Boolean(prefs.marketing_opt_in)} onChange={(e) => setPrefs({ ...prefs, marketing_opt_in: e.target.checked })} /> I consent to eligible marketing email</label>
            <label>Frequency
              <select value={String(prefs.digest)} onChange={(e) => setPrefs({ ...prefs, digest: e.target.value })}>
                <option value="important">Important only</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
            </label>
            <button className="primary-btn" type="button" onClick={() => post({ preferences: prefs }, "Email preferences saved.")}>Save email preferences</button>
          </div>
        )}

        {tab === "Settings" && (
          <div className="tp-state-card">
            <b>Account settings</b>
            <p>Password and OAuth providers are managed by the configured identity provider. Partner company administration is a separate application at <Link href="/partners/apply">/partners/apply</Link>.</p>
            <Link href="/legal/privacy">Privacy</Link>
          </div>
        )}
        {message ? <p>{message}</p> : null}
      </div>
    );
  }

  return (
    <form className="tp-finder" onSubmit={(e) => { e.preventDefault(); void auth(); }}>
      <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
      <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="primary-btn" type="submit" onClick={() => setMode("signin")}>Sign in</button>
        <button type="submit" onClick={() => setMode("signup")}>Create account</button>
      </div>
      {!oauth.google ? null : <p>Google sign-in is configured for this deployment.</p>}
      {!oauth.apple ? null : <p>Apple sign-in is configured for this deployment.</p>}
      {!oauth.google && !oauth.apple ? <p className="tp-muted">Google and Apple stay hidden until those providers are actually connected.</p> : null}
      {message ? <p>{message}</p> : null}
    </form>
  );
}
