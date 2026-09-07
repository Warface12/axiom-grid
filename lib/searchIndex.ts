import {createClient} from "@supabase/supabase-js";
import {visiblePlatformIdsForVisitor} from "@/lib/marketVisibility";
import {mapPlatformRow} from "@/lib/platforms";
import type {Platform} from "@/lib/types";

function db(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return null;
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function searchPlatforms(q:string,limit=20):Promise<Platform[]>{
  const s=db();
  const term=q.trim();
  if(!s||term.length<2)return[];
  const {ids}=await visiblePlatformIdsForVisitor();
  if(!ids.length)return[];
  const safe=term.replace(/[,%]/g,"");
  const {data,error}=await s.from("platform").select("*").in("id",ids).eq("visible",true).neq("status","restricted").or(`name.ilike.%${safe}%,short_description.ilike.%${safe}%,product_summary.ilike.%${safe}%`).limit(limit);
  if(error)return[];
  return (data||[]).map((row)=>mapPlatformRow(row as Record<string,unknown>)).filter((p)=>!p.archived);
}
