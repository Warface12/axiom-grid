import type { PlatformKind } from "@/lib/catalog";

export type CategorySignature = {
  id: PlatformKind | "markets" | "opportunities";
  accent: string;
  glow: string;
  object: "venue" | "keys" | "hex" | "card" | "ramp" | "node" | "lens" | "ledger" | "globe" | "vault";
};

export const SIGNATURES: Record<string, CategorySignature> = {
  exchange: { id: "exchange", accent: "#3ce8ff", glow: "rgba(60,232,255,.28)", object: "venue" },
  broker: { id: "broker", accent: "#7ea2ff", glow: "rgba(126,162,255,.28)", object: "venue" },
  dex: { id: "dex", accent: "#b08cff", glow: "rgba(176,140,255,.28)", object: "hex" },
  "trading-platform": { id: "trading-platform", accent: "#5ad0ff", glow: "rgba(90,208,255,.24)", object: "node" },
  wallet: { id: "wallet", accent: "#6ef0c4", glow: "rgba(110,240,196,.26)", object: "keys" },
  defi: { id: "defi", accent: "#c9a0ff", glow: "rgba(201,160,255,.26)", object: "hex" },
  staking: { id: "staking", accent: "#8be0a8", glow: "rgba(139,224,168,.24)", object: "node" },
  "crypto-card": { id: "crypto-card", accent: "#ffd27a", glow: "rgba(255,210,122,.22)", object: "card" },
  onramp: { id: "onramp", accent: "#ffb36a", glow: "rgba(255,179,106,.22)", object: "ramp" },
  tool: { id: "tool", accent: "#7fd4ff", glow: "rgba(127,212,255,.22)", object: "node" },
  explorer: { id: "explorer", accent: "#9ad0ff", glow: "rgba(154,208,255,.22)", object: "lens" },
  tax: { id: "tax", accent: "#d7c4a0", glow: "rgba(215,196,160,.2)", object: "ledger" },
  futures: { id: "futures", accent: "#5ad0ff", glow: "rgba(90,208,255,.24)", object: "venue" },
  "copy-trading": { id: "copy-trading", accent: "#7ea2ff", glow: "rgba(126,162,255,.26)", object: "node" },
  p2p: { id: "p2p", accent: "#ffb36a", glow: "rgba(255,179,106,.22)", object: "ramp" },
  nft: { id: "nft", accent: "#c9a0ff", glow: "rgba(201,160,255,.26)", object: "hex" },
  launchpad: { id: "launchpad", accent: "#ffd27a", glow: "rgba(255,210,122,.22)", object: "vault" },
  bridge: { id: "bridge", accent: "#7fd4ff", glow: "rgba(127,212,255,.22)", object: "ramp" },
  yield: { id: "yield", accent: "#8be0a8", glow: "rgba(139,224,168,.24)", object: "node" },
  insurance: { id: "insurance", accent: "#6ef0c4", glow: "rgba(110,240,196,.26)", object: "vault" },
  custody: { id: "custody", accent: "#6ef0c4", glow: "rgba(110,240,196,.26)", object: "keys" },
  identity: { id: "identity", accent: "#9ad0ff", glow: "rgba(154,208,255,.22)", object: "lens" },
  analytics: { id: "analytics", accent: "#7fd4ff", glow: "rgba(127,212,255,.22)", object: "lens" },
  mining: { id: "mining", accent: "#d7c4a0", glow: "rgba(215,196,160,.2)", object: "node" },
  layer2: { id: "layer2", accent: "#b08cff", glow: "rgba(176,140,255,.28)", object: "hex" },
  payments: { id: "payments", accent: "#ffb36a", glow: "rgba(255,179,106,.22)", object: "card" },
  institutional: { id: "institutional", accent: "#7ea2ff", glow: "rgba(126,162,255,.28)", object: "venue" },
  dao: { id: "dao", accent: "#c9a0ff", glow: "rgba(201,160,255,.26)", object: "hex" },
  oracle: { id: "oracle", accent: "#5ad0ff", glow: "rgba(90,208,255,.24)", object: "node" },
  validator: { id: "validator", accent: "#8be0a8", glow: "rgba(139,224,168,.24)", object: "keys" },
  stablecoin: { id: "stablecoin", accent: "#f0c56a", glow: "rgba(240,197,106,.22)", object: "ledger" },
  markets: { id: "markets", accent: "#4db7ff", glow: "rgba(77,183,255,.26)", object: "globe" },
  opportunities: { id: "opportunities", accent: "#f0c56a", glow: "rgba(240,197,106,.22)", object: "vault" },
};

export function signatureFor(id?: string | null) {
  return SIGNATURES[id || ""] || SIGNATURES.exchange;
}
