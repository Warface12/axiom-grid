"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ExternalLink, Gauge, ShieldCheck, Sparkles } from "lucide-react";

type Casino = {
  id:string; name:string; slug:string; logo_url?:string|null; rating?:number|null; crypto?:boolean|null; free_spins?:boolean|null; no_deposit?:boolean|null; live_chat?:boolean|null; mobile_app?:boolean|null; payment_methods?:string[]; payout_speed?:string|null; verified_at?:string|null; verification_status?:string|null;
};

function scoreCasino(c: Casino, prefs: {crypto:boolean;mobile:boolean;live:boolean;fast:boolean}) {
  const selected = Object.values(prefs).filter(Boolean).length;
  if (!selected) return Math.max(72, Math.min(96, Math.round((Number(c.rating)||7.8)*10)));
  let hit=0;
  if (prefs.crypto && c.crypto) hit++;
  if (prefs.mobile && c.mobile_app) hit++;
  if (prefs.live && c.live_chat) hit++;
  if (prefs.fast && c.payout_speed) hit++;
  return Math.round((hit/selected)*100);
}

export function SmartFinder({ casinos }: { casinos: Casino[] }) {
  const [crypto,setCrypto]=useState(false); const [mobile,setMobile]=useState(false); const [live,setLive]=useState(false); const [fast,setFast]=useState(false);
  const prefs={crypto,mobile,live,fast};
  const matches=useMemo(()=>casinos.map(c=>({c,score:scoreCasino(c,prefs)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score || Number(b.c.rating||0)-Number(a.c.rating||0)).slice(0,12),[casinos,crypto,mobile,live,fast]);
  return <div className="nmatch-shell">
    <section className="nmatch-controls" aria-label="Nivaro Match preferences">
      <div><span className="nmatch-kicker">YOUR PRIORITIES</span><h2>Build your Nivaro Match</h2><p>Pick what matters. Matching only runs across casinos already allowed by Nivaro Core for the current market.</p></div>
      <div className="nmatch-filter-grid">
        <label><input type="checkbox" checked={crypto} onChange={e=>setCrypto(e.target.checked)}/><span>Crypto support</span></label>
        <label><input type="checkbox" checked={mobile} onChange={e=>setMobile(e.target.checked)}/><span>Mobile app</span></label>
        <label><input type="checkbox" checked={live} onChange={e=>setLive(e.target.checked)}/><span>Live chat</span></label>
        <label><input type="checkbox" checked={fast} onChange={e=>setFast(e.target.checked)}/><span>Payout info available</span></label>
      </div>
    </section>
    <div className="nmatch-summary"><ShieldCheck size={17}/><span><strong>{matches.length}</strong> eligible matches</span><small>Fail-closed market gate stays in control.</small></div>
    <div className="nmatch-grid">{matches.map(({c,score},i)=><article className="nmatch-card" key={c.id}>
      <div className="nmatch-rank">#{i+1}</div><div className="nmatch-score"><Gauge size={16}/><strong>{score}%</strong><span>Nivaro Match</span></div>
      <div className="nmatch-brand">{c.logo_url?<img src={c.logo_url} alt={`${c.name} logo`} width={54} height={54}/>:<span>{c.name[0]}</span>}<div><h3>{c.name}</h3><small><BadgeCheck size={12}/> Market eligible</small></div></div>
      <div className="nmatch-reasons"><span><Sparkles size={12}/> Based on your selected preferences</span>{c.payout_speed?<span>Payout info: {c.payout_speed}</span>:null}</div>
      <div className="nmatch-actions"><Link href={`/casinos/${c.slug}`}>Trust Passport</Link><Link className="nmatch-primary" href={`/go/${c.id}?source=/finder`}>Visit operator <ExternalLink size={13}/></Link></div>
    </article>)}</div>
    {!matches.length?<div className="notice"><strong>No eligible match</strong><p>NivaroBet does not fill empty results with unapproved casinos. Change a preference or try again later.</p></div>:null}
  </div>;
}
