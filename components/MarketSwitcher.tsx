"use client";
import {useEffect,useState} from "react";
import {Globe2} from "lucide-react";
const markets=[
  ["","Auto"],["GB","UK"],["US","US"],["CA","Canada"],["AU","Australia"],["NZ","New Zealand"],["IE","Ireland"],["DE","Germany"],["FR","France"],["ES","Spain"],["IT","Italy"],["SE","Sweden"],["NO","Norway"],["FI","Finland"],["NL","Netherlands"],["SG","Singapore"]
];
export function MarketSwitcher(){
 const[value,setValue]=useState("");
 useEffect(()=>{const found=document.cookie.split("; ").find(x=>x.startsWith("toppick_market="));if(found)setValue(decodeURIComponent(found.split("=")[1]||""))},[]);
 function change(v:string){setValue(v);if(v)document.cookie=`toppick_market=${encodeURIComponent(v)}; Path=/; Max-Age=31536000; SameSite=Lax`;else document.cookie="toppick_market=; Path=/; Max-Age=0; SameSite=Lax";window.location.reload()}
 return <label className="tp-market-switcher" title="Market selector"><Globe2/><select aria-label="Market" value={value} onChange={e=>change(e.target.value)}>{markets.map(([code,label])=><option value={code} key={code||"auto"}>{label}</option>)}</select></label>
}
