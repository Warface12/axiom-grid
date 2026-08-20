export type PlatformKind = "exchange" | "broker" | "wallet";
export type PlatformStatus = "research" | "verified" | "restricted";

export type Platform = {
  slug: string;
  name: string;
  short: string;
  description: string;
  kind: PlatformKind;
  status: PlatformStatus;
  logoText: string;
  tags: string[];
  updatedAt: string;
  website: string;
  custody?: string | null;
  markets: string[];
  productNote: string;
};

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  category: "exchanges" | "brokers" | "wallets" | "learn";
  readTime: string;
};
