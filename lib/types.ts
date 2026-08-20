export type PlatformKind = "exchange" | "broker" | "wallet";

export type Platform = {
  id: string;
  slug: string;
  name: string;
  kind: PlatformKind;
  short: string;
  description: string;
  logoText: string;
  website: string;
  affiliateUrl?: string | null;
  status: "research" | "verified" | "restricted";
  featured?: boolean;
  tags: string[];
  markets: string[];
  custody?: "custodial" | "non-custodial" | "mixed" | null;
  productNote: string;
  updatedAt: string;
};

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  category: "exchanges" | "brokers" | "wallets" | "learn";
  readTime: string;
};
