import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <div className="admin-login-card admin-login-card-premium">
        <div className="admin-login-brand">
          <span className="nivaro-metal-mark" aria-hidden="true"><span className="nivaro-metal-n">N</span><span className="nivaro-red-slash"/><span className="nivaro-metal-shine"/></span>
          <div><strong><span className="brand-nivaro">NIVARO</span><span className="brand-bet">BET</span></strong><small>PRIVATE ADMIN</small></div>
        </div>
        <h1>Sign in</h1>
        <p>Authorized admin access only.</p>
        <Suspense fallback={<p>Loading...</p>}><AdminLoginForm /></Suspense>
      </div>
    </main>
  );
}
