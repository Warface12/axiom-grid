import crypto from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getSearchConsoleOpportunities,syncSearchConsoleMetrics } from "@/lib/searchConsole";
function key(parts:string[]){return crypto.createHash("sha256").update(parts.join("|")).digest("hex")}
export async function runSeoCycle({syncGsc=true}:{syncGsc?:boolean}={}){
 const supabase=await createSupabaseServiceClient();if(!supabase)throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
 const {data:run,error:runError}=await supabase.from("seo_run").insert({run_type:"daily",status:"running"}).select("*").single();if(runError)throw new Error(runError.message);
 let metrics=0;const errors:string[]=[];
 if(syncGsc){try{const result=await syncSearchConsoleMetrics();metrics=result.rows}catch(e){errors.push(e instanceof Error?e.message:"GSC sync failed")}}
 const opportunities=await getSearchConsoleOpportunities(100);let created=0;
 for(const o of opportunities){const position=Number(o.position||0),impressions=Number(o.impressions||0),ctr=Number(o.ctr||0);let type="content_depth",title="Strengthen page coverage for a ranking opportunity",priority=Math.min(95,Math.round(45+Math.log10(Math.max(10,impressions))*10));let reason=`Query “${o.query}” averages position ${position.toFixed(1)} with ${impressions} impressions.`;if(position<=15&&ctr<0.03){type="snippet_ctr";title="Review title and meta description for CTR";priority=Math.min(98,priority+10);reason+=` CTR is ${(ctr*100).toFixed(1)}%, so the search snippet may be underperforming.`}else if(position>15){type="content_depth";title="Expand useful coverage and internal links";reason+=" The page is visible but not yet near the top results."}const recommendation_key=key([String(o.page),String(o.query),type]);const {error}=await supabase.from("seo_recommendation").upsert({recommendation_key,page:o.page,query:o.query||null,type,priority,title,reason,payload:{country:o.country,device:o.device,position,impressions,clicks:o.clicks,ctr},status:"suggested",updated_at:new Date().toISOString()},{onConflict:"recommendation_key"});if(!error)created++}
 await supabase.from("seo_run").update({status:errors.length?"completed_with_warnings":"completed",property:process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL||"sc-domain:toppick.pro",metrics_synced:metrics,opportunities_found:opportunities.length,notes:{recommendations_created:created,errors},finished_at:new Date().toISOString()}).eq("id",run.id);
 return{ok:true,runId:run.id,metricsSynced:metrics,opportunities:opportunities.length,recommendations:created,warnings:errors};
}
export async function getSeoRecommendations(limit=30){const supabase=await createSupabaseServiceClient();if(!supabase)return[];const {data}=await supabase.from("seo_recommendation").select("*").eq("status","suggested").order("priority",{ascending:false}).limit(limit);return data||[]}
