import {headers} from "next/headers";
import {createClient} from "@supabase/supabase-js";

export type VisitorMarketContext={country:string|null;region:string|null;source:"manual"|"geo"|"unknown"};
export type PlatformMarketDecision={visible:boolean;commercial:boolean;country:string|null;region:string|null;reason:string;evidenceUrl:string|null;reviewedAt:string|null;expiresAt:string|null};

function service(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return null;
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function visitorMarketContext():Promise<VisitorMarketContext>{
  const h=await headers();
  const manual=(h.get("x-toppick-market-manual")||"").toUpperCase().trim();
  const country=(manual||h.get("x-toppick-market")||h.get("x-vercel-ip-country")||"").toUpperCase().trim()||null;
  const region=(h.get("x-toppick-region")||h.get("x-vercel-ip-country-region")||"").toUpperCase().trim()||null;
  return {country,region,source:manual?"manual":country?"geo":"unknown"};
}

export async function platformMarketDecision(platformId:string,ctx?:VisitorMarketContext):Promise<PlatformMarketDecision>{
  const market=ctx||await visitorMarketContext();
  if(!market.country)return{visible:false,commercial:false,country:null,region:market.region,reason:"Visitor market could not be verified, so this platform is hidden by default.",evidenceUrl:null,reviewedAt:null,expiresAt:null};
  const db=service();
  if(!db)return{visible:false,commercial:false,country:market.country,region:market.region,reason:"Market eligibility service is not configured.",evidenceUrl:null,reviewedAt:null,expiresAt:null};

  const {data,error}=await db.from("platform_market")
    .select("market_code,region_code,product_available,commercial_allowed,status,evidence_url,reviewed_at,expires_at")
    .eq("platform_id",platformId).eq("market_code",market.country);
  if(error||!data?.length)return{visible:false,commercial:false,country:market.country,region:market.region,reason:"No approved availability record exists for this market.",evidenceUrl:null,reviewedAt:null,expiresAt:null};

  const exact=market.region?data.find((r:any)=>String(r.region_code||"").toUpperCase()===market.region):null;
  const countryDefault=data.find((r:any)=>!r.region_code);
  const row=exact||countryDefault;
  if(!row)return{visible:false,commercial:false,country:market.country,region:market.region,reason:"This region has no approved availability record.",evidenceUrl:null,reviewedAt:null,expiresAt:null};
  const expired=Boolean(row.expires_at&&new Date(row.expires_at).getTime()<Date.now());
  const approved=row.status==="approved"&&!expired;
  const visible=approved&&row.product_available===true;
  const commercial=visible&&row.commercial_allowed===true;
  return {visible,commercial,country:market.country,region:market.region,reason:expired?"The eligibility review has expired.":!approved?"The market record is not approved.":!row.product_available?"The platform is not approved as available in this market.":commercial?"Approved for research visibility and partner routing.":"Approved for research visibility; promotional routing remains disabled.",evidenceUrl:row.evidence_url||null,reviewedAt:row.reviewed_at||null,expiresAt:row.expires_at||null};
}

export async function visiblePlatformIdsForVisitor(){
  const ctx=await visitorMarketContext();
  if(!ctx.country)return {ctx,ids:[] as string[]};
  const db=service();if(!db)return{ctx,ids:[] as string[]};
  const {data,error}=await db.from("platform_market").select("platform_id,region_code,product_available,status,expires_at").eq("market_code",ctx.country);
  if(error||!data)return{ctx,ids:[] as string[]};
  const now=Date.now();
  const byPlatform=new Map<string,any[]>();
  for(const row of data as any[]){const a=byPlatform.get(row.platform_id)||[];a.push(row);byPlatform.set(row.platform_id,a)}
  const ids:string[]=[];
  for(const [id,rows] of byPlatform){
    const exact=ctx.region?rows.find(r=>String(r.region_code||"").toUpperCase()===ctx.region):null;
    const fallback=rows.find(r=>!r.region_code);
    const chosen=exact||fallback;
    if(!chosen)continue;
    const expired=Boolean(chosen.expires_at&&new Date(chosen.expires_at).getTime()<now);
    if(!expired&&chosen.status==="approved"&&chosen.product_available===true)ids.push(id);
  }
  return {ctx,ids};
}
