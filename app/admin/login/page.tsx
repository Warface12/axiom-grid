"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "Login failed.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ax-login-screen">
      <section className="ax-login-card">
        <div className="ax-login-mark"><ShieldCheck /></div>
        <span className="ax-login-kicker">AXIOM GRID / SECURE CONTROL ROOM</span>
        <h1>Admin access</h1>
        <p>Sign in with the private administrator account configured for this deployment.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
          {error ? <div className="ax-login-error">{error}</div> : null}
          <button type="submit" disabled={loading}><LockKeyhole /> {loading ? "Checking…" : "Enter control room"}</button>
        </form>
      </section>
    </main>
  );
}
