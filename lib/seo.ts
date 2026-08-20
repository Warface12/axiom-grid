import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

type SeoInput={title?:string|null;description?:string|null;path?:string;ogImage?:string|null;noIndex?:boolean;type?:"website"|"article";keywords?:string[]};
const clean=(v:string)=>v.replace(/\s+/g," ").trim();
const clamp=(v:string,m:number)=>v.length<=m?v:`${v.slice(0,m-1).trimEnd()}…`;
const DEFAULT_DESCRIPTION="Independent research for crypto exchanges, brokers, wallets, fees, security and market access.";
export function buildMetadata(input:SeoInput):Metadata{const title=clamp(clean(input.title||`${SITE_NAME} — Digital Asset Intelligence`),68);const description=clamp(clean(input.description||DEFAULT_DESCRIPTION),160);const path=input.path||"/";const url=new URL(path,SITE_URL).toString();const ogImage=input.ogImage||`${SITE_URL}/og-default.png`;return{title,description,keywords:input.keywords,alternates:{canonical:url},openGraph:{title,description,url,siteName:SITE_NAME,type:input.type||"website",images:[{url:ogImage,width:1200,height:630,alt:title}]},twitter:{card:"summary_large_image",title,description,images:[ogImage]},robots:input.noIndex?{index:false,follow:true}:{index:true,follow:true}}}
export function organizationJsonLd(){return{"@context":"https://schema.org","@type":"Organization","@id":`${SITE_URL}/#organization`,name:SITE_NAME,url:SITE_URL,logo:{"@type":"ImageObject",url:`${SITE_URL}/icon.png`}}}
export function websiteJsonLd(){return{"@context":"https://schema.org","@type":"WebSite","@id":`${SITE_URL}/#website`,name:SITE_NAME,url:SITE_URL,publisher:{"@id":`${SITE_URL}/#organization`}}}
export function webPageJsonLd(input:{name:string;description:string;path:string}){return{"@context":"https://schema.org","@type":"WebPage",name:input.name,description:input.description,url:new URL(input.path,SITE_URL).toString(),isPartOf:{"@id":`${SITE_URL}/#website`},publisher:{"@id":`${SITE_URL}/#organization`}}}
export function breadcrumbJsonLd(items:{name:string;url:string}[]){return{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:items.map((item,i)=>({"@type":"ListItem",position:i+1,name:item.name,item:item.url}))}}
