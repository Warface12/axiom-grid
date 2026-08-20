import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
export default function AdminLoginPage(){return <main className="admin-login-page"><div className="admin-login-card"><div className="ax-admin-login-brand"><span>AG</span><div><strong>AXIOM GRID</strong><small>PRIVATE CONTROL ROOM</small></div></div><h1>Operator sign in</h1><p>Authorized admin access only.</p><Suspense fallback={<p>Loading…</p>}><AdminLoginForm/></Suspense></div></main>}
