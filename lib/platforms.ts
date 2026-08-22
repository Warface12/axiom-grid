import {createClient} from "@supabase/supabase-js";
import type {Platform,PlatformKind,PlatformStatus} from "@/lib/types";
import {visiblePlatformIdsForVisitor,platformMarketDecision,visitorMarketContext} from "@/lib/marketVisibility";

function serverClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return null;return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
function mapRow(row:any):Platform{const kind=(row.kind||"exchange") as PlatformKind;const status=(row.status||"research") as PlatformStatus;return{id:row.id,slug:row.slug,name:row.name,short:row.short_description||"Independent research profile with product, cost, security and market context.",description:row.full_review||row.short_description||`${row.name} research profile on TopPick.pro.`,kind,status,logoText:String(row.name||"TP").slice(0,2).toUpperCase(),logoUrl:row.logo_url||null,tags:Array.isArray(row.tags)?row.tags:[],updatedAt:row.updated_at?new Date(row.updated_at).toISOString().slice(0,10):"Recently",website:row.official_url||"#",affiliateUrl:row.affiliate_url||null,custody:row.custody_model||null,markets:[],productNote:row.regulatory_summary||"Availability, legal entity and product access can vary by jurisdiction. Confirm current eligibility and terms with the provider before opening an account.",feeSummary:row.fee_summary||null,securitySummary:row.security_summary||null,regulatorySummary:row.regulatory_summary||null,productSummary:row.product_summary||null,pros:Array.isArray(row.pros)?row.pros:[],cons:Array.isArray(row.cons)?row.cons:[],featured:Boolean(row.featured),visible:Boolean(row.visible),seoTitle:row.seo_title||null,seoDescription:row.seo_description||null}}

export async function getPublicPlatforms(kind?:PlatformKind,limit=100):Promise<Platform[]>{
 const supabase=serverClient();if(!supabase)return[];
 const {ids}=await visiblePlatformIdsForVisitor();if(!ids.length)return[];
 let query=supabase.from("platform").select("*").in("id",ids).eq("visible",true).neq("status","restricted").order("featured",{ascending:false}).order("updated_at",{ascending:false}).limit(limit);if(kind)query=query.eq("kind",kind);
 const {data,error}=await query;if(error){console.error("getPublicPlatforms:",error.message);return[]}
 return(data||[]).map(mapRow).sort((a:Platform,b:Platform)=>Number(b.featured)-Number(a.featured));
}

export async function getPublicPlatform(slug:string,kind?:PlatformKind):Promise<Platform|null>{
 const supabase=serverClient();if(!supabase)return null;
 let query=supabase.from("platform").select("*").eq("slug",slug).eq("visible",true).neq("status","restricted");if(kind)query=query.eq("kind",kind);
 const {data,error}=await query.maybeSingle();if(error||!data)return null;
 const decision=await platformMarketDecision(data.id,await visitorMarketContext());if(!decision.visible)return null;
 return mapRow(data);
}

// Metadata and sitemap helpers intentionally do not infer visitor geography. They expose only records already marked public.
export async function getResearchPlatform(slug:string,kind?:PlatformKind):Promise<Platform|null>{const supabase=serverClient();if(!supabase)return null;let q=supabase.from("platform").select("*").eq("slug",slug).eq("visible",true).neq("status","restricted");if(kind)q=q.eq("kind",kind);const{data}=await q.maybeSingle();return data?mapRow(data):null}
export async function getSitemapPlatforms(){const supabase=serverClient();if(!supabase)return[];const{data}=await supabase.from("platform").select("*").eq("visible",true).neq("status","restricted").limit(1000);return(data||[]).map(mapRow)}
