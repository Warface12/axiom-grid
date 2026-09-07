"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        setEmail("");
        setPassword("");
        router.replace("/admin");
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => ({}));
      setErrorMessage(typeof data.error === "string" && !/ADMIN_|PASSWORD|SECRET/i.test(data.error)
        ? data.error
        : "Could not sign in to the control room.");
    } catch {
      setErrorMessage("Could not connect to the admin login service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      id="toppick-admin-auth"
      name="toppick-admin-auth"
      className="admin-login-form"
      method="post"
      action="/api/admin/login"
      autoComplete="on"
      onSubmit={handleSubmit}
    >
      <label className="admin-field">
        <span>Admin email</span>
        <input
          type="email"
          name="admin-username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="section-admin username"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </label>
      <label className="admin-field">
        <span>Admin password</span>
        <input
          type="password"
          name="admin-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="section-admin current-password"
          required
        />
      </label>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Signing in…" : "Sign in to Admin"}</button>
    </form>
  );
}
