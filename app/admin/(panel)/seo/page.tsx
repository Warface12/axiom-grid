import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { reviewSeoAutomationChange } from "@/lib/actions/seoAutomation";
import { syncSearchConsoleMetricsForAdmin } from "@/lib/actions/searchConsole";
import { AdminHeader, AdminTable } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const supabase = await createSupabaseServiceClient();
  const pending = supabase ? (await supabase.from("seo_automation_change").select("*").eq("status","needs_review").order("created_at",{ascending:false}).limit(100)).data || [] : [];
  const metrics = supabase ? (await supabase.from("search_console_metric").select("page,query,country,device,clicks,impressions,ctr,position,data_date").gte("impressions",5).order("impressions",{ascending:false}).limit(50)).data || [] : [];
  const runs = supabase ? (await supabase.from("seo_automation_run").select("*").order("created_at",{ascending:false}).limit(10)).data || [] : [];
  const gscConfigured = Boolean(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL && process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY && process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL);
  const verificationConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);

  return <main className="admin-page-inner">
    <AdminHeader title="SEO & Search Console" subtitle="Prioritize pages using real Google Search data, review Gemini suggestions and keep indexing signals visible from one place." />
    <section className="admin-stat-grid">
      <div className="admin-stat-card"><span>Pending SEO reviews</span><strong>{pending.length}</strong></div>
      <div className="admin-stat-card"><span>Search opportunities</span><strong>{metrics.length}</strong></div>
      <div className="admin-stat-card"><span>Recent automation runs</span><strong>{runs.length}</strong></div>
      <div className="admin-stat-card"><span>Search Console API</span><strong>{gscConfigured ? "Ready" : "Setup"}</strong></div>
    </section>

    <section className="admin-panel-block search-console-control">
      <div><h2>Google Search Console</h2><p className="admin-muted">Verification: {verificationConfigured ? "configured" : "missing"} · API sync: {gscConfigured ? "configured" : "missing"} · Sitemap: https://nivarobet.best/sitemap.xml</p></div>
      {gscConfigured ? <form action={async()=>{"use server";await syncSearchConsoleMetricsForAdmin()}}><button className="primary-btn">Sync Search Console now</button></form> : <p className="admin-muted">Add the Search Console service-account environment variables in Vercel, grant that service account access to the Search Console property, then redeploy.</p>}
    </section>

    <section className="admin-panel-block"><h2>Needs Review</h2>{pending.length ? <div className="seo-review-list">{pending.map((change:any)=><article key={change.id} className="seo-review-card"><div><small>{change.target_type} · {change.target_key}</small><h3>{change.field_name}</h3><p>{change.reason}</p><span>Confidence: {Math.round(Number(change.confidence||0)*100)}%</span></div><details><summary>See suggested metadata</summary><pre>{change.new_value}</pre></details><div className="seo-review-actions"><form action={async()=>{"use server";await reviewSeoAutomationChange(change.id,"approve")}}><button className="primary-btn">Approve</button></form><form action={async()=>{"use server";await reviewSeoAutomationChange(change.id,"reject")}}><button className="secondary-btn">Reject</button></form></div></article>)}</div> : <p className="admin-muted">No SEO changes are waiting for review.</p>}</section>
    <section className="admin-panel-block"><h2>Search Console opportunities</h2><AdminTable headers={["Query","Page","Country","Device","Impressions","Clicks","CTR","Position"]} rows={metrics.map((row:any)=>[row.query||"—",row.page||"—",row.country||"—",row.device||"—",String(row.impressions??0),String(row.clicks??0),`${(Number(row.ctr||0)*100).toFixed(1)}%`,Number(row.position||0).toFixed(1)])}/></section>
  </main>;
}
