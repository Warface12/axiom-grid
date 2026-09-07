export const COMPANY_RELATIONSHIP = ["unclaimed", "claim_pending", "verified", "suspended", "revoked"] as const;
export const AFFILIATE_RELATIONSHIP = ["none", "pending", "active", "paused", "terminated"] as const;
export const ADVERTISING_RELATIONSHIP = ["none", "active", "paused", "suspended"] as const;
export const DIRECT_TRACKING = ["not_connected", "configuring", "testing", "active", "error", "paused"] as const;

export const PARTNER_ROLES = [
  "owner",
  "admin",
  "affiliate_manager",
  "marketing_manager",
  "content_manager",
  "analyst",
  "billing_manager",
  "agency_manager",
  "viewer",
] as const;

export const PARTNER_INTENT = [
  "advertising",
  "affiliate",
  "advertising_and_affiliate",
  "manage_presence",
  "other",
] as const;

export const APPLICATION_ROLES = [
  "affiliate_manager",
  "partnership_manager",
  "marketing_manager",
  "business_development",
  "company_administrator",
  "authorized_agency",
  "other",
] as const;

export const CAMPAIGN_TYPES = [
  "general_advertising",
  "welcome_offer",
  "crypto_reward",
  "trading_credit",
  "fee_promotion",
  "deposit_promotion",
  "trading_promotion",
  "learn_and_earn",
  "staking_promotion",
  "card_promotion",
  "wallet_promotion",
  "product_launch",
  "app_launch",
  "network_campaign",
  "crypto_game",
  "game_reward",
  "event",
  "tournament",
  "airdrop",
  "referral_campaign",
  "giveaway",
  "web3_campaign",
  "defi_campaign",
  "new_market_launch",
  "educational_campaign",
  "sponsored_content",
  "research_sponsorship",
  "other_reviewed_campaign",
] as const;

export const CAMPAIGN_STATES = [
  "draft",
  "pending_review",
  "changes_required",
  "awaiting_payment",
  "scheduled",
  "active",
  "paused",
  "completed",
  "rejected",
  "cancelled",
] as const;

export const REWARD_CLASSES = [
  "cash",
  "crypto_asset",
  "trading_credit",
  "promotional_credit",
  "in_game_points",
  "non_transferable_points",
  "token",
  "tradable_token",
  "nft",
  "conditional_reward",
  "random_reward",
  "unknown",
] as const;

export const OFFER_STATUSES = ["draft", "pending_review", "active", "paused", "expired", "rejected"] as const;
export const PROVENANCE = ["partner_provided", "toppick_verified", "toppick_research", "third_party_source"] as const;

export const CONVERSION_EVENTS = [
  "registration",
  "email_verified",
  "kyc_completed",
  "first_deposit",
  "qualified_deposit",
  "trade",
  "purchase",
  "qualified_customer",
  "commission_pending",
  "commission_approved",
  "commission_rejected",
  "commission_paid",
  "reversal",
] as const;

export const COMMISSION_MODELS = ["cpa", "revenue_share", "hybrid", "cpl", "fixed", "custom"] as const;

export type CompanyRelationship = (typeof COMPANY_RELATIONSHIP)[number];
export type AffiliateRelationship = (typeof AFFILIATE_RELATIONSHIP)[number];
export type AdvertisingRelationship = (typeof ADVERTISING_RELATIONSHIP)[number];
export type DirectTracking = (typeof DIRECT_TRACKING)[number];
export type PartnerRole = (typeof PARTNER_ROLES)[number];

export function isMemberOf<T extends readonly string[]>(list: T, value: string): value is T[number] {
  return (list as readonly string[]).includes(value);
}

export type MetricView =
  | { kind: "value"; value: number }
  | { kind: "not_tracked" }
  | { kind: "unknown" };

export function trackedMetric(tracked: boolean, value: number | null | undefined): MetricView {
  if (!tracked) return { kind: "not_tracked" };
  if (value == null || Number.isNaN(value)) return { kind: "unknown" };
  return { kind: "value", value };
}

export function assertSameTenant(memberPlatformId: string, resourcePlatformId: string) {
  if (memberPlatformId !== resourcePlatformId) throw new Error("Forbidden");
}

export function formatMetric(view: MetricView) {
  if (view.kind === "not_tracked") return "Not tracked";
  if (view.kind === "unknown") return "No data";
  return String(view.value);
}

export type CampaignDestinationKind = "official" | "partner_campaign" | "toppick_affiliate" | "tracking_redirect";

export function resolveCampaignDestination(input: {
  affiliateRelationship: AffiliateRelationship;
  affiliateUrl?: string | null;
  affiliatePermittedForCampaign?: boolean;
  partnerDestination?: string | null;
  officialUrl?: string | null;
}): { url: string | null; kind: CampaignDestinationKind | "missing" } {
  if (input.affiliateRelationship === "active" && input.affiliatePermittedForCampaign && input.affiliateUrl) {
    return { url: input.affiliateUrl, kind: "toppick_affiliate" };
  }
  if (input.partnerDestination) return { url: input.partnerDestination, kind: "partner_campaign" };
  if (input.officialUrl) return { url: input.officialUrl, kind: "official" };
  return { url: null, kind: "missing" };
}
