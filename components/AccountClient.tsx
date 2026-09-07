"use client";

import { useEffect, useState } from "react";

export function AccountClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [oauth, setOauth] = useState({ google: false, apple: false });
  const [session, setSession] = useState<{ email?: string } | null>(null);
  const [prefs, setPrefs] = useState({ offers: false, research: false, digest: "weekly", marketing_opt_in: false });

  async function refresh() {
    const r = await fetch("/api/account/me", { cache: "no-store" });
    const j = await r.json();
    setSession(j.user);
    if (j.preferences) setPrefs({ ...prefs, ...j.preferences });
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
    setMessage(j.needsEmailConfirm ? "Check your email to confirm the account. Nothing is published from this step." : "Signed in.");
    await refresh();
  }

  async function savePrefs() {
    await fetch("/api/account/me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ preferences: prefs }) });
    setMessage("Preferences saved.");
  }

  if (session?.email) {
    return (
      <div className="tp-finder">
        <p>Signed in as <b>{session.email}</b></p>
        <h2>Notification preferences</h2>
        <label><input type="checkbox" checked={prefs.offers} onChange={(e) => setPrefs({ ...prefs, offers: e.target.checked })} /> New crypto offers</label>
        <label><input type="checkbox" checked={prefs.research} onChange={(e) => setPrefs({ ...prefs, research: e.target.checked })} /> Research updates</label>
        <label><input type="checkbox" checked={prefs.marketing_opt_in} onChange={(e) => setPrefs({ ...prefs, marketing_opt_in: e.target.checked })} /> I want marketing email when eligible</label>
        <label>Frequency
          <select value={prefs.digest} onChange={(e) => setPrefs({ ...prefs, digest: e.target.value })}>
            <option value="important">Important only</option>
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly digest</option>
          </select>
        </label>
        <button className="primary-btn" type="button" onClick={savePrefs}>Save preferences</button>
        <div className="tp-state-card" style={{ marginTop: 16 }}>
          <b>Saved items</b>
          <p>No saved products, comparisons or follows yet. Directories stay empty until real profiles exist.</p>
        </div>
        <div className="tp-state-card">
          <b>Notification center</b>
          <p>No notifications. Promotional campaigns are never sent to every account automatically.</p>
        </div>
        {message ? <p>{message}</p> : null}
      </div>
    );
  }

  return (
    <form className="tp-finder" onSubmit={(e) => { e.preventDefault(); void auth(); }}>
      <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="primary-btn" type="submit" onClick={() => setMode("signin")}>Sign in</button>
        <button type="submit" onClick={() => setMode("signup")}>Create account</button>
      </div>
      {!oauth.google ? null : <p>Google sign-in is configured for this deployment.</p>}
      {!oauth.apple ? null : <p>Apple sign-in is configured for this deployment.</p>}
      {!oauth.google && !oauth.apple ? <p className="tp-muted">Google and Apple buttons are hidden until those OAuth providers are configured.</p> : null}
      {message ? <p>{message}</p> : null}
    </form>
  );
}
