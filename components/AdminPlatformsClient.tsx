"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

type Row = {
  id: string;
  slug: string;
  name: string;
  kind: "exchange" | "broker" | "wallet";
  status: "research" | "verified" | "restricted";
  custody_model?: string | null;
  official_url?: string | null;
  affiliate_url?: string | null;
  affiliate_partner_id?: string | null;
  short_description?: string | null;
  logo_url?: string | null;
  tags?: string[] | null;
  featured?: boolean;
  visible?: boolean;
  updated_at?: string | null;
};

const blank = { name:"", slug:"", kind:"exchange", status:"research", official_url:"", affiliate_url:"", affiliate_partner_id:"", short_description:"", full_review:"", logo_url:"", custody_model:"", tags:"", fee_summary:"", security_summary:"", regulatory_summary:"", product_summary:"", pros:"", cons:"", seo_title:"", seo_description:"", featured:false, visible:false };

export function AdminPlatformsClient() {
  const [rows,setRows]=useState<Row[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [query,setQuery]=useState("");
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState<any>(blank);

  async function load(){
    setLoading(true); setMessage("");
    try{const r=await fetch("/api/admin/platforms",{cache:"no-store"});const j=await r.json();setRows(j.items||[]);if(!j.ok)setMessage(j.error||"Could not load platforms.");}
    catch{setMessage("Could not connect to the admin data service.");}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[]);
  const filtered=useMemo(()=>rows.filter(r=>`${r.name} ${r.slug} ${r.kind}`.toLowerCase().includes(query.toLowerCase())),[rows,query]);
  function edit(row?:any){setForm(row?{...row,tags:(row.tags||[]).join(", "),pros:(row.pros||[]).join(", "),cons:(row.cons||[]).join(", ")}:blank);setOpen(true)}
  async function save(e:React.FormEvent){e.preventDefault();setMessage("Saving partner…");const r=await fetch("/api/admin/platforms",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok){setMessage(j.error||"Save failed.");return}setOpen(false);setMessage("Partner saved successfully.");await load()}
  async function remove(id:string,name:string){if(!confirm(`Delete ${name}?`))return;const r=await fetch(`/api/admin/platforms?id=${encodeURIComponent(id)}`,{method:"DELETE"});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok){setMessage(j.error||"Delete failed.");return}await load()}

  return <>
    <div className="ax-inventory-toolbar"><div className="ax-inventory-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search inventory…"/></div><button className="ax-tool-btn" onClick={load}><RefreshCw/>Refresh</button><button className="ax-primary-btn" onClick={()=>edit()}><Plus/>Add partner</button></div>
    {message&&<div className="ax-admin-alert">{message}</div>}
    <div className="ax-inventory-grid">
      <div className="ax-inventory-head"><span>PLATFORM</span><span>TYPE</span><span>STATUS</span><span>PUBLIC</span><span>UPDATED</span><span/></div>
      {loading?<div className="ax-inventory-empty">Loading inventory…</div>:filtered.length===0?<div className="ax-inventory-empty"><b>No partner records yet.</b><span>Use “Add partner” to create the first exchange, broker or wallet record.</span></div>:filtered.map(row=><div className="ax-inventory-row" key={row.id}>
        <button className="ax-platform-name" onClick={()=>edit(row)}><i>{row.name.slice(0,2).toUpperCase()}</i><span><b>{row.name}</b><small>{row.slug}</small></span></button>
        <span className="ax-type-chip">{row.kind}</span><span className={`ax-state-chip is-${row.status}`}>{row.status}</span><span>{row.visible?"Visible":"Hidden"}</span><span>{row.updated_at?new Date(row.updated_at).toLocaleDateString():"—"}</span><span className="ax-row-actions">{row.official_url&&<a href={row.official_url} target="_blank" rel="noreferrer" aria-label="Open official site"><ExternalLink/></a>}<button onClick={()=>remove(row.id,row.name)} aria-label="Delete"><Trash2/></button></span>
      </div>)}
    </div>
    {open&&<div className="ax-modal-backdrop" onMouseDown={()=>setOpen(false)}><form className="ax-partner-modal" onSubmit={save} onMouseDown={e=>e.stopPropagation()}><div className="ax-modal-head"><div><span>PARTNER INTAKE</span><h2>{form.id?"Edit platform":"Add platform"}</h2></div><button type="button" onClick={()=>setOpen(false)}><X/></button></div>
      <div className="ax-form-grid"><label>Name<input required value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Slug<input value={form.slug||""} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="auto-from-name"/></label><label>Type<select value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}><option value="exchange">Exchange</option><option value="broker">Broker</option><option value="wallet">Wallet</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="research">Research</option><option value="verified">Verified</option><option value="restricted">Restricted</option></select></label><label className="wide">Official URL<input value={form.official_url||""} onChange={e=>setForm({...form,official_url:e.target.value})} placeholder="https://…"/></label><label className="wide">Affiliate URL<input value={form.affiliate_url||""} onChange={e=>setForm({...form,affiliate_url:e.target.value})} placeholder="Partner tracking link"/></label><label>Partner / affiliate ID<input value={form.affiliate_partner_id||""} onChange={e=>setForm({...form,affiliate_partner_id:e.target.value})}/></label><label>Custody model<input value={form.custody_model||""} onChange={e=>setForm({...form,custody_model:e.target.value})} placeholder="custodial / mixed…"/></label><label className="wide">Short description<textarea value={form.short_description||""} onChange={e=>setForm({...form,short_description:e.target.value})}/></label><label className="wide">Logo URL<input value={form.logo_url||""} onChange={e=>setForm({...form,logo_url:e.target.value})}/></label><label className="wide">Tags<input value={form.tags||""} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="spot, forex, hardware"/></label><label className="wide">Product summary<textarea value={form.product_summary||""} onChange={e=>setForm({...form,product_summary:e.target.value})} placeholder="Products, markets and account scope"/></label><label className="wide">Fees / spreads<textarea value={form.fee_summary||""} onChange={e=>setForm({...form,fee_summary:e.target.value})} placeholder="Verified fee summary"/></label><label className="wide">Security / custody<textarea value={form.security_summary||""} onChange={e=>setForm({...form,security_summary:e.target.value})} placeholder="Security controls and custody notes"/></label><label className="wide">Regulatory context<textarea value={form.regulatory_summary||""} onChange={e=>setForm({...form,regulatory_summary:e.target.value})} placeholder="Entity, regulator and market restrictions"/></label><label className="wide">Full review<textarea className="tall" value={form.full_review||""} onChange={e=>setForm({...form,full_review:e.target.value})} placeholder="Editorial review draft"/></label><label className="wide">Pros<input value={form.pros||""} onChange={e=>setForm({...form,pros:e.target.value})} placeholder="comma-separated"/></label><label className="wide">Cons<input value={form.cons||""} onChange={e=>setForm({...form,cons:e.target.value})} placeholder="comma-separated"/></label><label className="wide">SEO title<input value={form.seo_title||""} onChange={e=>setForm({...form,seo_title:e.target.value})}/></label><label className="wide">SEO description<textarea value={form.seo_description||""} onChange={e=>setForm({...form,seo_description:e.target.value})}/></label></div>
      <div className="ax-toggle-row"><label><input type="checkbox" checked={!!form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={!!form.visible} onChange={e=>setForm({...form,visible:e.target.checked})}/> Publicly visible</label></div>
      <div className="ax-modal-foot"><button type="button" className="ax-tool-btn" onClick={()=>setOpen(false)}>Cancel</button><button className="ax-primary-btn" type="submit">Save partner</button></div>
    </form></div>}
  </>
}
