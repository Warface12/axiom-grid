"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, ArrowUpRight, BookOpenText, Boxes, Globe2, LayoutDashboard, LogOut, SearchCheck, Settings2, TerminalSquare } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return <div className="ax-admin"><aside className="ax-admin-rail"><Link href="/admin" className="ax-admin-logo"><span>AG</span><b>{SITE_NAME}</b><small>CONTROL ROOM</small></Link><nav><Link href="/admin"><LayoutDashboard/><span>Overview</span></Link><Link href="/admin/platforms"><Boxes/><span>Inventory</span></Link><Link href="/admin/content"><BookOpenText/><span>Editorial</span></Link><Link href="/admin/markets"><Globe2/><span>Markets</span></Link><Link href="/admin/seo"><SearchCheck/><span>Search</span></Link><Link href="/admin/monitoring"><Activity/><span>Monitoring</span></Link></nav><div className="ax-admin-rail-bottom"><Link href="/"><ArrowUpRight/>Public site</Link><button type="button" onClick={logout} className="ax-admin-logout"><LogOut/>Sign out</button><span><Settings2/>Project isolated</span></div></aside><div className="ax-admin-canvas"><div className="ax-admin-top"><span><TerminalSquare/> AXIOM GRID OPERATIONS</span><div><i/> SYSTEM ONLINE</div></div>{children}</div></div>;
}

export function AdminTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="ax-admin-title"><span>OPERATIONS / {title.toUpperCase()}</span><h1>{title}</h1><p>{subtitle}</p></div>;
}
