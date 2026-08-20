"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCasino } from "@/lib/actions/admin";

type Casino = Record<string, any>;

const input: React.CSSProperties = { width:"100%", boxSizing:"border-box", padding:"11px 13px", borderRadius:12, border:"1px solid rgba(255,255,255,.1)", background:"#0c1119", color:"#fff", outline:"none" };
const label: React.CSSProperties = { display:"block", marginBottom:6, fontSize:11, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color:"#94a3b8" };
const grid: React.CSSProperties = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:14 };

function Field({name,title,value,type="text",placeholder,required=false}: any){return <label><span style={label}>{title}</span><input style={input} name={name} type={type} defaultValue={value ?? ""} placeholder={placeholder} required={required}/></label>}
function Area({name,title,value,placeholder}: any){return <label><span style={label}>{title}</span><textarea style={{...input,minHeight:90,resize:"vertical"}} name={name} defaultValue={value ?? ""} placeholder={placeholder}/></label>}
function Toggle({name,title,checked=false}: any){return <label style={{display:"flex",gap:9,alignItems:"center",color:"#dbe3ee",fontWeight:700}}><input type="hidden" name={name} value="false"/><input type="checkbox" name={name} value="true" defaultChecked={checked}/>{title}</label>}

export function CasinoForm({casino}: {casino?: Casino}) {
  const router=useRouter();
  const [more,setMore]=useState(false);
  const [state,action,pending]=useActionState(async (_:any,fd:FormData)=>{
    const r=await saveCasino(fd);
    if ("success" in r && r.success){ router.push("/admin/casinos"); router.refresh(); }
    return r;
  },{} as any);

  return <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,.82)",display:"grid",placeItems:"center",padding:16}}>
    <div style={{width:"min(860px,100%)",maxHeight:"94vh",overflow:"auto",border:"1px solid rgba(255,255,255,.1)",borderRadius:22,background:"linear-gradient(180deg,#111720,#080b11)",boxShadow:"0 30px 90px rgba(0,0,0,.6)"}}>
      <div style={{padding:"20px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div><div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{casino?.id?`Edit ${casino.name}`:"Add Casino"}</div><div style={{fontSize:13,color:"#7f8b9c",marginTop:4}}>Simple manual editor — only useful casino data, no AI import.</div></div>
        <button type="button" onClick={()=>router.push("/admin/casinos")} style={{background:"transparent",border:0,color:"#fff",fontSize:24,cursor:"pointer"}}>×</button>
      </div>
      <form action={action} style={{padding:22,display:"grid",gap:20}}>
        {casino?.id && <input type="hidden" name="id" value={casino.id}/>} 
        <input type="hidden" name="slug" value={casino?.slug ?? ""}/>
        <input type="hidden" name="ai_import_enabled" value="false"/>
        <input type="hidden" name="ai_import_status" value="not_started"/>
        <input type="hidden" name="monitoring_enabled" value="false"/>
        <input type="hidden" name="auto_update_enabled" value="false"/>
        <input type="hidden" name="monitoring_alerts_enabled" value="false"/>
        <input type="hidden" name="monitoring_mode" value="manual"/>
        <input type="hidden" name="monitoring_status" value="manual"/>
        <input type="hidden" name="visible" value="false"/>

        <section style={{display:"grid",gap:14}}>
          <div style={{fontWeight:900,color:"#fff"}}>Essentials</div>
          <div style={grid}>
            <Field name="name" title="Casino name *" value={casino?.name} required/>
            <Field name="affiliate_url" title="Affiliate URL *" value={casino?.affiliate_url} placeholder="https://..." required/>
            <Field name="official_url" title="Official website" value={casino?.official_url} placeholder="https://..."/>
            <Field name="logo_url" title="Logo URL" value={casino?.logo_url} placeholder="https://.../logo.png"/>
            <Field name="rating" title="Rating (0–10)" type="number" value={casino?.rating ?? 0} placeholder="8.5"/>
          </div>
          <Area name="description" title="Short description" value={casino?.description} placeholder="2–3 useful sentences about the casino."/>
          <div style={{padding:"11px 13px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.025)",color:"#94a3b8",fontSize:12,lineHeight:1.6}}>Market visibility is controlled only from <strong style={{color:"#dbe3ee"}}>Market Compliance</strong>. New or uncertain markets stay hidden by default.</div>
          <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
            <Toggle name="active" title="Active" checked={casino?.active ?? true}/>
            <Toggle name="featured" title="Featured" checked={casino?.featured ?? false}/>
          </div>
        </section>

        <button type="button" onClick={()=>setMore(v=>!v)} style={{justifySelf:"start",padding:"9px 13px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",color:"#dbe3ee",cursor:"pointer",fontWeight:800}}>{more?"Hide optional details":"+ Optional details"}</button>

        {more && <section style={{display:"grid",gap:16,paddingTop:4}}>
          <div style={grid}>
            <Field name="license_authority" title="License authority" value={casino?.license_authority}/>
            <Field name="license_number" title="License number" value={casino?.license_number}/>
            <Field name="owner_name" title="Operator / owner" value={casino?.owner_name}/>
            <Field name="founded_year" title="Founded" type="number" value={casino?.founded_year}/>
            <Field name="payment_methods" title="Payment methods" value={(casino?.payment_methods ?? []).join(", ")} placeholder="Visa, Mastercard, Skrill"/>
            <Field name="providers" title="Game providers" value={(casino?.providers ?? []).join(", ")} placeholder="Pragmatic Play, Evolution"/>
            <Field name="currencies" title="Currencies" value={(casino?.currencies ?? []).join(", ")} placeholder="EUR, GBP, CAD"/>
            <Field name="languages" title="Languages" value={(casino?.languages ?? []).join(", ")} placeholder="English, German"/>
            <Field name="min_deposit" title="Minimum deposit" value={casino?.min_deposit}/>
            <Field name="payout_speed" title="Payout speed" value={casino?.payout_speed} placeholder="0–2 days"/>
            <Field name="support_email" title="Support email" value={casino?.support_email}/>
            <Field name="support_url" title="Support URL" value={casino?.support_url}/>
          </div>
          <div style={grid}>
            <Area name="pros" title="Pros" value={(casino?.pros ?? []).join("\n")} placeholder="One per line"/>
            <Area name="cons" title="Cons" value={(casino?.cons ?? []).join("\n")} placeholder="One per line"/>
          </div>
          <Area name="review_content" title="Review notes / full review" value={casino?.review_content}/>
        </section>}

        {/* Preserve legacy fields without forcing the admin to edit them. */}
        {[
          "cover_image_url","final_verdict","welcome_bonus","no_deposit_bonus","free_spins_details","cashback","license_info","withdrawal_info","withdrawal_limits","affiliate_partner_id","affiliate_partner_external_id","seo_title","seo_description","last_checked_at","last_successful_check_at","next_check_at","last_monitoring_error"
        ].map(k=><input key={k} type="hidden" name={k} value={casino?.[k] ?? ""}/>)}
        {[["region_codes",casino?.region_codes],["us_states",casino?.us_states],["games",casino?.games]].map(([k,v]:any)=><input key={k} type="hidden" name={k} value={(v??[]).join(", ")}/>)}
        {["no_deposit","free_spins","crypto","kyc_required","mobile_app","live_chat","vip_program"].map(k=><input key={k} type="hidden" name={k} value={casino?.[k] ? "true":"false"}/>)}
        <input type="hidden" name="free_spins_count" value={casino?.free_spins_count ?? ""}/><input type="hidden" name="sort_order" value={casino?.sort_order ?? 0}/>

        {state?.error && <div style={{padding:12,borderRadius:10,background:"rgba(239,68,68,.12)",color:"#fecaca"}}>{state.error}</div>}
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:18}}>
          <button type="button" onClick={()=>router.push("/admin/casinos")} className="secondary-btn">Cancel</button>
          <button type="submit" disabled={pending} className="primary-btn">{pending?"Saving...":"Save Casino"}</button>
        </div>
      </form>
    </div>
  </div>
}
