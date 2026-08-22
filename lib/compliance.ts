import {platformMarketDecision,visitorMarketContext} from "@/lib/marketVisibility";
export type PromotionDecision={allowed:boolean;reason:string;marketCode:string|null;source:string|null;reviewedAt:string|null};
export async function visitorMarket(){return(await visitorMarketContext()).country}
export async function partnerPromotionDecision(platformId:string,marketCode?:string|null):Promise<PromotionDecision>{const ctx=await visitorMarketContext();if(marketCode)ctx.country=marketCode.toUpperCase();const d=await platformMarketDecision(platformId,ctx);return{allowed:d.commercial,reason:d.reason,marketCode:d.country,source:d.evidenceUrl,reviewedAt:d.reviewedAt}}
