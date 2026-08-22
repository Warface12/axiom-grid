export type MarketPolicy={code:string;name:string;region?:string;currency?:string;language:string;publicResearch:boolean;commercialDefault:"blocked"|"review";notes:string};
export const MARKET_POLICIES:MarketPolicy[]=[
 {code:"GB",name:"United Kingdom",currency:"GBP",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Provider entity, permissions, product scope and financial-promotion eligibility must be confirmed before a partner CTA is enabled."},
 {code:"EEA",name:"European Economic Area",currency:"EUR",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Member-state rules differ. EEA is a research grouping only; commercial eligibility must be stored per country."},
 {code:"CA",name:"Canada",currency:"CAD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Availability can vary by province and product type. Provincial review is required before promotion."},
 {code:"AU",name:"Australia",currency:"AUD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research may be public, but promotional links require provider and market-specific approval."},
 {code:"SG",name:"Singapore",currency:"SGD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research-only by default. No commercial CTA without documented eligibility."},
];
export function getMarketPolicy(code?:string|null){const key=(code||"").toUpperCase();return MARKET_POLICIES.find(m=>m.code===key)||null}
export function marketLabel(code?:string|null){return getMarketPolicy(code)?.name||"International"}
