export type MarketPolicy={code:string;name:string;region?:string;currency?:string;language:string;publicResearch:boolean;commercialDefault:"blocked"|"review";notes:string};
export const MARKET_POLICIES:MarketPolicy[]=[
 {code:"GB",name:"United Kingdom",currency:"GBP",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Provider entity, permissions, product scope and financial-promotion eligibility must be confirmed before a partner CTA is enabled."},
 {code:"EEA",name:"European Economic Area",currency:"EUR",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Member-state rules differ. EEA is a research grouping only; commercial eligibility must be stored per country."},
 {code:"CA",name:"Canada",currency:"CAD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Availability can vary by province and product type. Provincial review is required before promotion."},
 {code:"AU",name:"Australia",currency:"AUD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research may be public, but promotional links require provider and market-specific approval."},
 {code:"SG",name:"Singapore",currency:"SGD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research-only by default. No commercial CTA without documented eligibility."},
 {code:"US",name:"United States",currency:"USD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Federal and state rules differ. A national homepage is not proof of state-level access or promotional eligibility."},
 {code:"JP",name:"Japan",currency:"JPY",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research may be public. Partner CTAs stay blocked until a current Japan eligibility record exists."},
 {code:"AE",name:"United Arab Emirates",currency:"AED",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Free-zone and onshore rules differ. Promotion stays blocked until the entity and market are documented."},
 {code:"BR",name:"Brazil",currency:"BRL",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research-only by default. Commercial links require a current Brazil eligibility record."},
 {code:"IN",name:"India",currency:"INR",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Tax and product rules change. TopPick will not infer availability from a global banner."},
 {code:"CH",name:"Switzerland",currency:"CHF",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Cantonal and federal context can differ. Promotion stays blocked until documented."},
 {code:"HK",name:"Hong Kong",currency:"HKD",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research may be public. Partner CTAs require a current Hong Kong eligibility record."},
 {code:"ZA",name:"South Africa",currency:"ZAR",language:"en",publicResearch:true,commercialDefault:"blocked",notes:"Research-only by default. No commercial CTA without documented eligibility."},
];
export function getMarketPolicy(code?:string|null){const key=(code||"").toUpperCase();return MARKET_POLICIES.find(m=>m.code===key)||null}
export function marketLabel(code?:string|null){return getMarketPolicy(code)?.name||"International"}
