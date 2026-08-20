export type MarketCode = "ontario" | "gb" | "dk";

export type MarketRule = {
  code: MarketCode;
  label: string;
  countryCode: string;
  regionCode?: string;
  minimumAge: number;
  regulatorName: string;
  registryUrl: string;
  regulatorHost: string;
  bonusPublicPromotionDefault: boolean;
  requiresAffiliatePermission: boolean;
  notes: string;
};

export const MARKET_RULES: Record<MarketCode, MarketRule> = {
  ontario: {
    code: "ontario",
    label: "Ontario",
    countryCode: "CA",
    regionCode: "ON",
    minimumAge: 19,
    regulatorName: "iGaming Ontario / AGCO",
    registryUrl: "https://www.igamingontario.ca/en/operator/operators",
    regulatorHost: "igamingontario.ca",
    bonusPublicPromotionDefault: false,
    requiresAffiliatePermission: true,
    notes: "Fail-closed. A brand/domain must be matched to the official Ontario regulated market and the affiliate relationship must permit Ontario traffic. Public bonus/inducement promotion remains disabled unless a human legal/compliance review explicitly approves it.",
  },
  gb: {
    code: "gb",
    label: "United Kingdom",
    countryCode: "GB",
    minimumAge: 18,
    regulatorName: "UK Gambling Commission",
    registryUrl: "https://www.gamblingcommission.gov.uk/public-register/businesses",
    regulatorHost: "gamblingcommission.gov.uk",
    bonusPublicPromotionDefault: false,
    requiresAffiliatePermission: true,
    notes: "Fail-closed. UK publication requires an exact regulator/domain match plus affiliate permission. Promotional content remains review-gated so significant conditions can be checked before publication.",
  },
  dk: {
    code: "dk",
    label: "Denmark",
    countryCode: "DK",
    minimumAge: 18,
    regulatorName: "Danish Gambling Authority",
    registryUrl: "https://spillemyndigheden.dk/en-us/licensed-gambling-operators",
    regulatorHost: "spillemyndigheden.dk",
    bonusPublicPromotionDefault: false,
    requiresAffiliatePermission: true,
    notes: "Fail-closed. Danish publication requires a current licensed-operator/domain match plus affiliate permission. Offer publication is separately review-gated.",
  },
};

export const ACTIVE_MARKETS = Object.keys(MARKET_RULES) as MarketCode[];

export function marketFromGeo(country: string | null | undefined, region: string | null | undefined): MarketCode | null {
  const c = (country || "").toUpperCase();
  const r = (region || "").toUpperCase();
  if (c === "CA" && r === "ON") return "ontario";
  if (c === "GB") return "gb";
  if (c === "DK") return "dk";
  return null;
}

export function marketLabel(code: MarketCode) {
  return MARKET_RULES[code].label;
}
