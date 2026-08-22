export type PlatformKind = "exchange" | "broker" | "wallet";
export type PlatformStatus = "research" | "verified" | "restricted";
export type Platform = {
  id?: string;
  slug:string; name:string; short:string; description:string; kind:PlatformKind; status:PlatformStatus;
  logoText:string; logoUrl?:string|null; tags:string[]; updatedAt:string; website:string; affiliateUrl?:string|null;
  custody?:string|null; markets:string[]; productNote:string; feeSummary?:string|null; securitySummary?:string|null;
  regulatorySummary?:string|null; productSummary?:string|null; pros?:string[]; cons?:string[]; featured?:boolean; visible?:boolean;
  seoTitle?:string|null; seoDescription?:string|null;
};
export type Guide={slug:string;title:string;excerpt:string;category:"exchanges"|"brokers"|"wallets"|"learn";readTime:string};
