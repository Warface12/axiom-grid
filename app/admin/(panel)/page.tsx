import Link from "next/link";
import { ArrowUpRight, Building2, Gift, MousePointerClick, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { getAdminAnalytics, getBonuses, getCasinoCount, getGuides } from "@/lib/data";

export default async function AdminOverviewPage() {
  const [analytics, totalCasinos, bonuses, guides] = await Promise.all([getAdminAnalytics(), getCasinoCount({}), getBonuses({}), getGuides()]);
  const chart = analytics.topPages.length ? analytics.topPages.slice(0, 10).map(p => Math.max(1, p.views)) : [2,5,4,7,6,9,8,12,7,11];
  const max = Math.max(...chart, 1);
  const points = chart.map((v, i) => `${(i/(chart.length-1 || 1))*100},${50-(v/max)*42}`).join(" ");

  return <main className="admin-page-inner ref-admin-dashboard">
    <AdminHeader title="Dashboard" subtitle="NivaroBet performance, partner content and traffic overview."/>
    <section className="ref-admin-stat-grid">
      <RefStat label="Total Casinos" value={totalCasinos} icon={<Building2 size={22}/>}/>
      <RefStat label="Total Bonuses" value={bonuses.length} icon={<Gift size={22}/>}/>
      <RefStat label="Published Guides" value={guides.length} icon={<ArrowUpRight size={22}/>}/>
      <RefStat label="Visitors" value={analytics.visitors} icon={<Users size={22}/>}/>
    </section>

    <section className="ref-admin-main-grid">
      <div className="ref-admin-chart-card">
        <div className="ref-admin-card-head"><div><strong>Traffic Overview</strong><small>Last 30 days</small></div><span>This Month⌄</span></div>
        <svg viewBox="0 0 100 55" preserveAspectRatio="none" aria-label="Traffic overview chart">
          <defs><linearGradient id="redFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ed1c24" stopOpacity=".25"/><stop offset="1" stopColor="#ed1c24" stopOpacity="0"/></linearGradient></defs>
          {[12,24,36,48].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,.06)" strokeWidth=".4"/>)}
          <polyline points={points} fill="none" stroke="#267ce8" strokeWidth="1.1" vectorEffect="non-scaling-stroke"/>
          <polygon points={`0,55 ${points} 100,55`} fill="url(#redFill)" opacity=".35"/>
          <polyline points={points.split(" ").map((p,i)=>{const [x,y]=p.split(',').map(Number);return `${x},${Math.min(53,y+8+(i%3)*2)}`}).join(' ')} fill="none" stroke="#e3262f" strokeWidth="1.1" vectorEffect="non-scaling-stroke"/>
        </svg>
      </div>

      <div className="ref-admin-side-card"><div className="ref-admin-card-head"><strong>Top Pages</strong><Link href="/admin/seo">View all</Link></div>{analytics.topPages.slice(0,5).map((p,i)=><div className="ref-admin-rank" key={p.path}><b>{i+1}.</b><span>{p.path}</span><strong>{p.views}</strong></div>)}{!analytics.topPages.length ? <p className="ref-admin-empty-note">Traffic data will appear here.</p> : null}</div>

      <div className="ref-admin-side-card"><div className="ref-admin-card-head"><strong>Top Casinos</strong><Link href="/admin/casinos">View all</Link></div>{analytics.topCasinos.slice(0,5).map((c,i)=><div className="ref-admin-rank" key={c.name}><b>{i+1}.</b><span>{c.name}</span><strong>{c.clicks}</strong></div>)}{!analytics.topCasinos.length ? <p className="ref-admin-empty-note">Casino click data will appear here.</p> : null}</div>
    </section>

    <section className="ref-admin-quick-row"><Link href="/admin/casinos"><Building2/>Manage casinos<span>Partner listings and verification</span></Link><Link href="/admin/bonuses"><Gift/>Manage bonuses<span>Offers and promo content</span></Link><Link href="/admin/monitoring"><MousePointerClick/>AI monitoring<span>Automated checks and reviews</span></Link></section>
  </main>;
}

function RefStat({label,value,icon}:{label:string;value:string|number;icon:React.ReactNode}){return <div className="ref-admin-stat"><div><small>{label}</small><strong>{value}</strong></div><span>{icon}</span></div>}
