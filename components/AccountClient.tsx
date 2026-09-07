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
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [desk, setDesk] = useState<Desk | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [prefs, setPrefs] = useState(emptyPrefs);
  const [interests, setInterests] = useState<string[]>([]);

  async function refresh() {
    try {
      const r = await fetch("/api/account/me", { cache: "no-store", credentials: "same-origin" });
      const j = await r.json().catch(() => null);
      if (!j || j.unavailable) {
        setDesk({ user: j?.user || null });
        if (j?.user) setMessage(j?.error || "We could not load your saved items right now. Try again shortly.");
        return;
      }
      setDesk(j);
      if (j.preferences) setPrefs({ ...emptyPrefs, ...j.preferences });
      if (Array.isArray(j.interests)) setInterests(j.interests);
    } catch {
      setDesk({ user: null });
    }
  }

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, []);

  async function auth(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const r = await fetch("/api/account/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email,
          password,
          confirm,
          acceptedTerms: accepted,
          mode,
        }),
      });
      const j = await r.json().catch(() => null);
      if (!j?.ok) {
        setMessage(j?.error || "Could not complete that request.");
        return;
      }
      setPassword("");
      setConfirm("");
      setMessage(j.needsEmailConfirm ? "Check your email to confirm the account before signing in." : "Signed in.");
      await refresh();
    } catch {
      setMessage("We could not reach the sign-in service. Try again in a moment.");
    }
  }

  async function signOut() {
    await fetch("/api/account/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "signout" }),
    });
    setDesk({ user: null });
    setEmail("");
    setPassword("");
    setConfirm("");
    setMessage("");
  }

  async function post(payload: object, okMessage: string) {
    const r = await fetch("/api/account/me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => null);
    if (!j?.ok) { setMessage(j?.error || "Could not save."); return; }
    setMessage(okMessage);
    await refresh();
  }

  if (!ready) {
    return <div className="tp-state-card"><span>ACCOUNT</span><h2>Loading…</h2><p>Checking whether you are signed in.</p></div>;
  }

  if (desk?.user?.email) {
    const unread = (desk.notifications || []).filter((n) => !n.read_at).length;
    const tabs = ["Overview", "Saved", "Following", "Opportunities", "Notifications", "Interests", "Email", "Games", "Settings"];
    return (
      <div className="tp-account-desk">
        <p className="tp-muted">Signed in as <b>{desk.user.email}</b>. This is a personal TopPick account — it cannot open Admin or a company workspace.</p>
        <div className="tp-filter-bar" style={{ flexWrap: "wrap" }}>
          {tabs.map((item) => (
            <button key={item} type="button" className="ag-icon-btn" style={{ width: "auto", padding: "0 12px" }} onClick={() => setTab(item)}>{item}{item === "Notifications" && unread ? ` (${unread})` : ""}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="tp-tool-grid">
            <article className="tp-tool-card"><small>SAVED</small><b>{desk.items?.length || 0}</b><p>Products, guides and comparisons you keep.</p></article>
            <article className="tp-tool-card"><small>FOLLOWING</small><b>{desk.follows?.length || 0}</b><p>Companies on your watchlist.</p></article>
            <article className="tp-tool-card"><small>NOTIFICATIONS</small><b>{unread}</b><p>In-product notices. Marketing email stays off unless you opt in.</p></article>
            <article className="tp-tool-card"><small>INTERESTS</small><b>{interests.length || "Optional"}</b><p>Used for For You and future app alerts.</p></article>
          </div>
        )}

        {tab === "Saved" && (
          <div className="tp-state-card">
            <b>Saved products, guides and comparisons</b>
            {(desk.items || []).length ? (
              <ul>{desk.items!.map((item) => <li key={item.id}>{item.item_type}: {item.item_id}</li>)}</ul>
            ) : <p>Nothing saved yet. Use Save on a published profile or comparison.</p>}
          </div>
        )}

        {tab === "Following" && (
          <div className="tp-state-card">
            <b>Watchlist</b>
            {(desk.follows || []).length ? (
              <ul>{desk.follows!.map((item) => (
                <li key={item.id}>
                  {item.platform_id}
                  <button type="button" onClick={() => post({ unfollow: { platform_id: item.platform_id } }, "Removed from watchlist.")}>Unfollow</button>
                </li>
              ))}</ul>
            ) : <p>You are not following any published company yet.</p>}
          </div>
        )}

        {tab === "Opportunities" && (
          <div className="tp-state-card">
            <b>Opportunities</b>
            <p>Saved offers appear here after a reviewed opportunity exists.</p>
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
            )) : <p>No notifications yet.</p>}
          </div>
        )}

        {tab === "Interests" && (
          <div className="tp-finder">
            <p>Optional. Helps future For You, digest and app alerts.</p>
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

        {tab === "Games" && (
          <div className="tp-state-card">
            <b>Games & app continuity</b>
            <p>TopPick original games and installable app progress will appear here when those surfaces ship. Nothing is invented in the meantime.</p>
            <Link href="/apps">Install the app</Link>
          </div>
        )}

        {tab === "Settings" && (
          <div className="tp-state-card">
            <b>Account settings</b>
            <p>Company pages are a separate partner application. Admin is a separate protected sign-in.</p>
            <Link href="/partners/apply">Partner application</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <button type="button" onClick={() => void signOut()}>Sign out</button>
          </div>
        )}
        {message ? <p role="status">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="tp-account-auth">
      <div className="tp-filter-bar" style={{ flexWrap: "wrap" }}>
        <button type="button" className={mode === "signin" ? "tp-auth-mode is-active" : "tp-auth-mode"} aria-pressed={mode === "signin"} onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button>
        <button type="button" className={mode === "signup" ? "tp-auth-mode is-active" : "tp-auth-mode"} aria-pressed={mode === "signup"} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button>
      </div>
      <form
        id="toppick-consumer-auth"
        name="toppick-consumer-auth"
        className="tp-finder"
        method="post"
        action="/api/account/session"
        autoComplete="on"
        onSubmit={(e) => void auth(e)}
      >
        <input type="hidden" name="auth-context" value="toppick-consumer" readOnly />
        <label>Email
          <input
            type="email"
            name="consumer-email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="section-consumer email"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="email"
          />
        </label>
        <label>Password
          <input
            type="password"
            name={mode === "signup" ? "consumer-new-password" : "consumer-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "section-consumer new-password" : "section-consumer current-password"}
          />
        </label>
        {mode === "signup" ? (
          <>
            <label>Confirm password
              <input
                type="password"
                name="consumer-password-confirm"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="section-consumer new-password"
              />
            </label>
            <label>
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required />
              I agree to the <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy policy</Link>.
            </label>
          </>
        ) : null}
        <button className="primary-btn" type="submit">{mode === "signup" ? "Create account" : "Sign in"}</button>
        {message ? <p role="alert">{message}</p> : null}
      </form>
    </div>
  );
}
