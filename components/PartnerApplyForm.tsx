"use client";

import { useState } from "react";
import { APPLICATION_ROLES, PARTNER_INTENT } from "@/lib/ecosystem";

const roleLabel: Record<string, string> = {
  affiliate_manager: "Affiliate manager",
  partnership_manager: "Partnership manager",
  marketing_manager: "Marketing manager",
  business_development: "Business development",
  company_administrator: "Company administrator",
  authorized_agency: "Authorized agency",
  other: "Other business representative",
};

const intentLabel: Record<string, string> = {
  advertising: "Advertising",
  affiliate: "Affiliate partnership",
  advertising_and_affiliate: "Advertising + affiliate partnership",
  manage_presence: "Manage company presence",
  other: "Other business partnership",
};

export function PartnerApplyForm() {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    official_website: "",
    representative_name: "",
    business_email: "",
    representative_role: "partnership_manager",
    intent: "advertising",
  });

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (!j.ok) { setMessage(j.error || "Could not submit."); return; }
      setStep(4);
      setMessage(
        j.claimSuggested
          ? `Application received. A matching company record already exists (${j.existingName}). This is a claim request, not a duplicate company.`
          : "Application received. It is queued for email verification and review. This is not yet partner access.",
      );
      if (j.email?.ownerAction) setMessage((m) => `${m} Email sending is not configured yet (${j.email.ownerAction}).`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="tp-finder" onSubmit={(e) => { e.preventDefault(); if (step < 3) setStep(step + 1); else void submit(); }}>
      <p><b>Step {step} of 4</b></p>
      {step === 1 && (
        <fieldset>
          <legend>Company</legend>
          <label>Company name<input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></label>
          <label>Official website<input required type="url" placeholder="https://" value={form.official_website} onChange={(e) => setForm({ ...form, official_website: e.target.value })} /></label>
        </fieldset>
      )}
      {step === 2 && (
        <fieldset>
          <legend>Representative</legend>
          <label>Your name<input required value={form.representative_name} onChange={(e) => setForm({ ...form, representative_name: e.target.value })} /></label>
          <label>Business email<input required type="email" value={form.business_email} onChange={(e) => setForm({ ...form, business_email: e.target.value })} /></label>
          <label>Role
            <select value={form.representative_role} onChange={(e) => setForm({ ...form, representative_role: e.target.value })}>
              {APPLICATION_ROLES.map((role) => <option key={role} value={role}>{roleLabel[role]}</option>)}
            </select>
          </label>
        </fieldset>
      )}
      {step === 3 && (
        <fieldset>
          <legend>How do you want to work with TopPick?</legend>
          {PARTNER_INTENT.map((intent) => (
            <label key={intent}>
              <input type="radio" name="intent" checked={form.intent === intent} onChange={() => setForm({ ...form, intent })} />
              {intentLabel[intent]}
            </label>
          ))}
        </fieldset>
      )}
      {step === 4 && <p>{message}</p>}
      {step < 4 && (
        <div style={{ display: "flex", gap: 8 }}>
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)}>Back</button>}
          <button className="primary-btn" disabled={busy} type="submit">{step === 3 ? (busy ? "Submitting…" : "Submit application") : "Continue"}</button>
        </div>
      )}
      {step < 4 && message ? <p>{message}</p> : null}
    </form>
  );
}
