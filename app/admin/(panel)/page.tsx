import Link from "next/link";
import { Boxes, BookOpenText, Globe2, Activity, SearchCheck, ArrowUpRight, ShieldCheck } from "lucide-react";
import { AdminTitle } from "@/components/AdminShell";
import { adminDb } from "@/lib/adminDb";

export default async function Page() {
  const db = adminDb();
  let kpis = {
    platforms: 0, visible: 0, drafts: 0, featured: 0, exchanges: 0, brokers: 0, wallets: 0,
    marketRules: 0, commercialOpen: 0, expiredRules: 0, missingSeo: 0, missingAffiliate: 0, clicks: 0,
  };
  if (db) {
    const [{ data: platforms }, { data: markets }, { count: clicks }] = await Promise.all([
      db.from("platform").select("id,kind,status,visible,featured,seo_title,seo_description,affiliate_url"),
      db.from("platform_market").select("id,status,commercial_allowed,expires_at"),
      db.from("affiliate_click").select("id", { count: "exact", head: true }),
    ]);
    const items = platforms || [];
    const rules = markets || [];
    const now = Date.now();
    kpis = {
      platforms: items.length,
      visible: items.filter((p) => p.visible).length,
      drafts: items.filter((p) => !p.visible).length,
      featured: items.filter((p) => p.featured).length,
      exchanges: items.filter((p) => p.kind === "exchange").length,
      brokers: items.filter((p) => p.kind === "broker").length,
      wallets: items.filter((p) => p.kind === "wallet").length,
      marketRules: rules.length,
      commercialOpen: rules.filter((r) => r.commercial_allowed && r.status === "approved").length,
      expiredRules: rules.filter((r) => r.expires_at && new Date(r.expires_at).getTime() < now).length,
      missingSeo: items.filter((p) => !p.seo_title || !p.seo_description).length,
      missingAffiliate: items.filter((p) => p.visible && !p.affiliate_url).length,
      clicks: clicks || 0,
    };
  }

  return (
    <main className="ax-admin-page">
      <AdminTitle title="Overview" subtitle="Live inventory, market gates, SEO gaps and partner routing from the current database." />
      <section className="ax-admin-metrics">
        <div><small>INVENTORY</small><strong>{kpis.platforms}</strong><span>{kpis.visible} public · {kpis.drafts} hidden</span></div>
        <div><small>PRODUCT MIX</small><strong>{kpis.brokers + kpis.exchanges + kpis.wallets}</strong><span>{kpis.exchanges} EX · {kpis.brokers} BR · {kpis.wallets} WA</span></div>
        <div><small>GEO RULES</small><strong>{kpis.marketRules}</strong><span>{kpis.commercialOpen} commercial · {kpis.expiredRules} expired</span></div>
        <div><small>QUALITY</small><strong>{kpis.missingSeo}</strong><span>{kpis.missingAffiliate} public records missing affiliate URL · {kpis.clicks} tracked clicks</span></div>
      </section>
      <section className="ax-admin-launch">
        <Link href="/admin/platforms"><Boxes /><b>Partner inventory</b><span>Add, import from URL, duplicate and publish</span><ArrowUpRight /></Link>
        <Link href="/admin/content"><BookOpenText /><b>Editorial</b><span>Research and partner updates</span><ArrowUpRight /></Link>
        <Link href="/admin/markets"><Globe2 /><b>Markets</b><span>Availability, GEO affiliates and commercial gates</span><ArrowUpRight /></Link>
        <Link href="/admin/monitoring"><Activity /><b>Monitoring</b><span>Freshness and expiry findings</span><ArrowUpRight /></Link>
        <Link href="/admin/seo"><SearchCheck /><b>SEO & Search</b><span>Search Console opportunities</span><ArrowUpRight /></Link>
        <Link href="/editorial-policy"><ShieldCheck /><b>Policy framework</b><span>Editorial / commercial separation</span><ArrowUpRight /></Link>
      </section>
    </main>
  );
}
