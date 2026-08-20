import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

type SeoInput = { title?: string; description: string; path?: string; noIndex?: boolean; type?: "website"|"article"; keywords?: string[] };
const clean = (s:string) => s.replace(/\s+/g," ").trim();
const clamp = (s:string,n:number) => s.length <= n ? s : `${s.slice(0,n-1).trimEnd()}…`;
export function buildMetadata(input: SeoInput): Metadata {
  const title = clamp(clean(input.title || SITE_NAME), 62);
  const description = clamp(clean(input.description), 160);
  const path = input.path || "/";
  const url = new URL(path, SITE_URL).toString();
  return {
    title, description, keywords: input.keywords,
    alternates:{ canonical:url },
    openGraph:{ title,description,url,siteName:SITE_NAME,type:input.type||"website",images:[{url:`${SITE_URL}/og-default.svg`,width:1200,height:630,alt:title}]},
    twitter:{card:"summary_large_image",title,description,images:[`${SITE_URL}/og-default.svg`]},
    robots: input.noIndex ? {index:false,follow:true} : {index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}}
  };
}
export const organizationJsonLd = () => ({"@context":"https://schema.org","@type":"Organization","@id":`${SITE_URL}/#organization`,name:SITE_NAME,url:SITE_URL});
export const websiteJsonLd = () => ({"@context":"https://schema.org","@type":"WebSite","@id":`${SITE_URL}/#website`,name:SITE_NAME,url:SITE_URL,publisher:{"@id":`${SITE_URL}/#organization`}});
export const webPageJsonLd = (i:{name:string;description:string;path:string}) => ({"@context":"https://schema.org","@type":"WebPage",name:i.name,description:i.description,url:new URL(i.path,SITE_URL).toString(),isPartOf:{"@id":`${SITE_URL}/#website`}});
export const breadcrumbJsonLd = (items:{name:string;url:string}[]) => ({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:items.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,item:item.url}))});
export const itemListJsonLd = (items:{name:string;url:string}[]) => ({"@context":"https://schema.org","@type":"ItemList",numberOfItems:items.length,itemListElement:items.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,url:item.url}))});
export const reviewJsonLd = (p:{name:string;slug:string;description:string}) => ({"@context":"https://schema.org","@type":"Review",itemReviewed:{"@type":"SoftwareApplication",name:p.name,url:`${SITE_URL}/platforms/${p.slug}`},author:{"@id":`${SITE_URL}/#organization`},reviewBody:p.description});
