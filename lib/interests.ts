import { USER_INTERESTS, isMemberOf } from "@/lib/ecosystem";

export const INTEREST_LABELS: Record<(typeof USER_INTERESTS)[number], string> = {
  exchanges: "Exchanges",
  wallets: "Wallets",
  hardware_wallets: "Hardware wallets",
  trading: "Trading",
  defi: "DeFi",
  staking: "Staking",
  cards: "Cards",
  tools: "Tools",
  analytics: "Analytics",
  learn_and_earn: "Learn & earn",
  crypto_games: "Crypto games",
  events: "Events",
  security: "Security",
  research: "Research",
};

export function sanitizeInterests(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values.map((item) => String(item)).filter((item) => isMemberOf(USER_INTERESTS, item)).slice(0, USER_INTERESTS.length);
}
