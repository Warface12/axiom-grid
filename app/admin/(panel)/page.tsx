import Link from "next/link";
import { Boxes, BookOpenText, Globe2, Activity, SearchCheck, ArrowUpRight, ShieldCheck } from "lucide-react";
import { AdminTitle } from "@/components/AdminShell";
import { adminDb } from "@/lib/adminDb";
import { computeAdminKpis } from "@/lib/adminKpis";
import { CATALOG } from "@/lib/catalog";

export default async function Page() {
  const db = adminDb();
  let kpis = computeAdminKpis([], [], 0);
  let applications = 0;
  let pendingOffers = 0;
  let pendingCampaigns = 0;
  if (db) {
    const [platformRes, marketRes, clickRes, appRes, offerRes, campaignRes] = await Promise.all([
      db.from("platform").select("*"),
      db.from("platform_market").select("id,status,commercial_allowed,expires_at"),
      db.from("affiliate_click").select("id", { count: "exact", head: true }),
      db.from("partner_application").select("id", { count: "exact", head: true }).in("status", ["submitted", "email_pending", "in_review"]),
      db.from("offer").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      db.from("campaign").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    ]);
    kpis = computeAdminKpis(platformRes.data || [], marketRes.data || [], clickRes.count || 0);
    applications = appRes.count || 0;
    pendingOffers = offerRes.count || 0;
    pendingCampaigns = campaignRes.count || 0;
  }
  const mix = CATALOG.map((c) => `${kpis.byKind[c.id] || 0} ${c.id.replace("-", " ")}`).slice(0, 4).join(" · ");

  return (
    <main className="ax-admin-page">
      <AdminTitle title="Overview" subtitle="Live inventory, market gates, SEO gaps and partner routing from the current database. Zero records is a valid starting state." />
      <section className="ax-admin-metrics">
        <div><small>INVENTORY</small><strong>{kpis.platforms}</strong><span>{kpis.visible} public · {kpis.drafts} hidden</span></div>
        <div><small>PRODUCT MIX</small><strong>{kpis.platforms}</strong><span>{mix || "No categories populated"}</span></div>
        <div><small>GEO RULES</small><strong>{kpis.marketRules}</strong><span>{kpis.commercialOpen} commercial · {kpis.expiredRules} expired</span></div>
        <div><small>QUALITY</small><strong>{kpis.needsReview}</strong><span>{kpis.missingSeo} missing SEO · {kpis.missingAffiliate} public without affiliate URL</span></div>
      </section>
      <section className="ax-admin-metrics">
        <div><small>APPLICATIONS</small><strong>{applications}</strong><span>In review / pending email</span></div>
        <div><small>OFFERS</small><strong>{pendingOffers}</strong><span>Awaiting review</span></div>
        <div><small>CAMPAIGNS</small><strong>{pendingCampaigns}</strong><span>Awaiting review</span></div>
        <div><small>CLICKS</small><strong>{kpis.clicks}</strong><span>Affiliate click ledger</span></div>
      </section>
      <section className="ax-admin-launch">
        <Link href="/admin/partners"><Globe2 /><b>Partners</b><span>Applications, claims and commercial states</span><ArrowUpRight /></Link>
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
