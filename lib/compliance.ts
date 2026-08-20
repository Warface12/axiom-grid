import { headers } from "next/headers";
import { marketFromGeo, type MarketCode } from "@/lib/nivaro-core/markets";

export type PublicMarket = MarketCode;
export const ACTIVE_PUBLIC_MARKETS: PublicMarket[] = ["gb", "dk", "ontario"];
export const HARD_BLOCKED_COUNTRIES = new Set(["GE"]);

export async function isOwnerPreview(): Promise<boolean> {
  const h = await headers();
  return h.get("x-nivaro-owner") === "1";
}

export async function getVisitorMarket(): Promise<PublicMarket | null> {
  const h = await headers();
  const country = (h.get("x-nivaro-country") || h.get("x-vercel-ip-country") || "").toUpperCase();
  const region = (h.get("x-nivaro-region") || h.get("x-vercel-ip-country-region") || "").toUpperCase();
  return marketFromGeo(country, region);
}

export function publicMarketFilter(market: PublicMarket) {
  if (market === "ontario") return { marketCode: "ontario" as const, countryCode: "CA", regionCode: "ontario" };
  return { marketCode: market, countryCode: market.toUpperCase() };
}

export function marketCodeFromFilters(countryCode?: string, regionCode?: string): PublicMarket | null {
  const country = (countryCode || "").toUpperCase();
  const region = (regionCode || "").toLowerCase();
  if (country === "CA" && region === "ontario") return "ontario";
  if (country === "GB") return "gb";
  if (country === "DK") return "dk";
  return null;
}

export function marketLabel(market: PublicMarket) {
  if (market === "gb") return "United Kingdom";
  if (market === "dk") return "Denmark";
  return "Ontario";
}
