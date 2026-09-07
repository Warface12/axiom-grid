export const PLATFORM_KIND_IDS = [
  "exchange",
  "dex",
  "broker",
  "trading-platform",
  "wallet",
  "defi",
  "staking",
  "crypto-card",
  "onramp",
  "tool",
  "explorer",
  "tax",
] as const;

export type PlatformKind = (typeof PLATFORM_KIND_IDS)[number];

export type AttributeField = {
  key: string;
  label: string;
  type: "bool" | "text";
};

export type CatalogKind = {
  id: PlatformKind;
  hub: string;
  label: string;
  plural: string;
  group: string;
  dedicated: boolean;
  summary: string;
  subcategories: string[];
  attributes: AttributeField[];
  compareKeys: string[];
};

const bool = (key: string, label: string): AttributeField => ({ key, label, type: "bool" });
const text = (key: string, label: string): AttributeField => ({ key, label, type: "text" });

export const CATALOG: CatalogKind[] = [
  {
    id: "exchange",
    hub: "exchanges",
    label: "Centralized exchange",
    plural: "Exchanges",
    group: "Trading venues",
    dedicated: true,
    summary: "Custodial spot and derivatives venues researched by product scope, fees, funding, security context and market eligibility.",
    subcategories: ["spot", "derivatives", "hybrid"],
    attributes: [
      bool("spot", "Spot trading"),
      bool("margin", "Margin"),
      bool("futures", "Futures"),
      bool("options", "Options"),
      bool("staking", "Staking / earn"),
      bool("p2p", "P2P"),
      bool("fiat", "Fiat support"),
      bool("api", "Public API"),
      bool("tradingview", "TradingView integration"),
      bool("mobile_app", "Mobile app"),
      text("kyc", "KYC (as published)"),
    ],
    compareKeys: ["custody", "feeSummary", "spot", "futures", "margin", "staking", "fiat", "api", "mobile_app", "kyc"],
  },
  {
    id: "dex",
    hub: "dex",
    label: "Decentralized exchange",
    plural: "DEXs",
    group: "Trading venues",
    dedicated: false,
    summary: "Non-custodial swap and order-book protocols compared only on disclosed networks, custody model and published mechanics.",
    subcategories: ["amm", "order-book", "aggregator"],
    attributes: [
      bool("spot", "Spot / swap"),
      bool("perps", "Perpetuals"),
      bool("aggregator", "Aggregator"),
      text("networks", "Networks (as published)"),
      bool("open_source", "Open-source (if stated)"),
    ],
    compareKeys: ["custody", "networks", "spot", "perps", "open_source", "securitySummary"],
  },
  {
    id: "broker",
    hub: "brokers",
    label: "Broker",
    plural: "Brokers",
    group: "Trading venues",
    dedicated: true,
    summary: "Forex, CFD and multi-asset brokers reviewed by legal entity, instruments, cost disclosures and market access — not mixed with spot crypto venues.",
    subcategories: ["forex", "cfd", "multi-asset"],
    attributes: [
      bool("forex", "Forex"),
      bool("cfd", "CFDs"),
      bool("crypto_cfd", "Crypto CFDs"),
      bool("mt4", "MT4"),
      bool("mt5", "MT5"),
      text("kyc", "Onboarding (as published)"),
    ],
    compareKeys: ["feeSummary", "regulatorySummary", "forex", "cfd", "mt4", "mt5", "kyc"],
  },
  {
    id: "trading-platform",
    hub: "trading",
    label: "Trading platform",
    plural: "Trading platforms",
    group: "Trading venues",
    dedicated: false,
    summary: "Execution front-ends and multi-venue terminals compared by disclosed connectivity, instruments and custody relationship.",
    subcategories: ["terminal", "social", "copy"],
    attributes: [
      bool("spot", "Spot"),
      bool("futures", "Futures"),
      bool("api", "API"),
      bool("tradingview", "TradingView"),
      bool("mobile_app", "Mobile app"),
      bool("desktop_app", "Desktop app"),
    ],
    compareKeys: ["productSummary", "spot", "futures", "api", "mobile_app", "desktop_app"],
  },
  {
    id: "wallet",
    hub: "wallets",
    label: "Wallet",
    plural: "Wallets",
    group: "Custody",
    dedicated: true,
    summary: "Hardware, software, mobile and web wallets compared by custody, recovery, chain support and what the user actually controls.",
    subcategories: ["hardware", "software", "mobile", "browser", "custodial"],
    attributes: [
      bool("hardware", "Hardware device"),
      bool("mobile_app", "Mobile app"),
      bool("desktop_app", "Desktop app"),
      bool("browser_extension", "Browser extension"),
      bool("swap", "Built-in swap"),
      bool("staking", "Staking"),
      bool("nft", "NFT support"),
      bool("open_source", "Open-source (if stated)"),
      text("networks", "Networks (as published)"),
    ],
    compareKeys: ["custody", "hardware", "mobile_app", "browser_extension", "swap", "staking", "nft", "networks", "open_source"],
  },
  {
    id: "defi",
    hub: "defi",
    label: "DeFi platform",
    plural: "DeFi platforms",
    group: "On-chain",
    dedicated: false,
    summary: "On-chain apps researched from public documentation only. Yields and TVL are never invented.",
    subcategories: ["lending", "liquidity", "other"],
    attributes: [
      bool("lending", "Lending"),
      bool("swap", "Swap"),
      bool("staking", "Staking / lockups"),
      text("networks", "Networks (as published)"),
      bool("open_source", "Open-source (if stated)"),
    ],
    compareKeys: ["custody", "networks", "lending", "swap", "staking", "open_source"],
  },
  {
    id: "staking",
    hub: "staking",
    label: "Staking / earn",
    plural: "Staking & earn",
    group: "On-chain",
    dedicated: false,
    summary: "Earn and staking products compared on custody, lockups and disclosed terms. APY is only shown when a sourced figure exists.",
    subcategories: ["native", "liquid", "custodial-earn"],
    attributes: [
      bool("liquid_staking", "Liquid staking"),
      bool("custodial_earn", "Custodial earn"),
      text("lockup", "Lockup (as published)"),
      text("networks", "Networks (as published)"),
    ],
    compareKeys: ["custody", "liquid_staking", "custodial_earn", "lockup", "networks", "feeSummary"],
  },
  {
    id: "crypto-card",
    hub: "crypto-cards",
    label: "Crypto card",
    plural: "Crypto cards",
    group: "Payments",
    dedicated: false,
    summary: "Spend cards compared on issuer, custody of the underlying balance, fees and published market eligibility.",
    subcategories: ["debit", "credit"],
    attributes: [
      bool("fiat", "Fiat settlement"),
      text("networks", "Card network (as published)"),
      text("kyc", "KYC (as published)"),
    ],
    compareKeys: ["custody", "feeSummary", "fiat", "kyc", "regulatorySummary"],
  },
  {
    id: "onramp",
    hub: "on-ramps",
    label: "On/off-ramp",
    plural: "On/off-ramps",
    group: "Payments",
    dedicated: false,
    summary: "Fiat ramps compared on published payment rails, KYC and destination assets — never by guessed country coverage.",
    subcategories: ["on-ramp", "off-ramp", "both"],
    attributes: [
      bool("onramp", "Buy crypto"),
      bool("offramp", "Sell crypto"),
      text("rails", "Payment rails (as published)"),
      text("kyc", "KYC (as published)"),
    ],
    compareKeys: ["onramp", "offramp", "rails", "kyc", "feeSummary"],
  },
  {
    id: "tool",
    hub: "tools",
    label: "Trading / analytics tool",
    plural: "Tools",
    group: "Tools",
    dedicated: false,
    summary: "Bots, trackers and data tools compared on disclosed features. Market prices are never simulated here.",
    subcategories: ["bot", "portfolio", "analytics", "security"],
    attributes: [
      bool("bot", "Automation / bot"),
      bool("portfolio", "Portfolio tracking"),
      bool("analytics", "Analytics / data"),
      bool("api", "API"),
      bool("mobile_app", "Mobile app"),
    ],
    compareKeys: ["bot", "portfolio", "analytics", "api", "mobile_app", "productSummary"],
  },
  {
    id: "explorer",
    hub: "explorers",
    label: "Blockchain explorer",
    plural: "Explorers",
    group: "Infrastructure",
    dedicated: false,
    summary: "Block explorers and chain browsers compared on disclosed networks, APIs and what they actually index — never simulated chain data.",
    subcategories: ["l1", "l2", "multi-chain"],
    attributes: [
      bool("api", "Public API"),
      text("networks", "Networks (as published)"),
      bool("analytics", "Analytics views"),
    ],
    compareKeys: ["networks", "api", "analytics", "productSummary"],
  },
  {
    id: "tax",
    hub: "tax",
    label: "Crypto tax / accounting",
    plural: "Tax & accounting",
    group: "Tools",
    dedicated: false,
    summary: "Tax and accounting products compared on published jurisdictions, import methods and reporting scope. This is not tax advice.",
    subcategories: ["tax", "accounting", "bookkeeping"],
    attributes: [
      bool("api", "API / CSV import"),
      text("kyc", "Account requirements (as published)"),
      bool("mobile_app", "Mobile app"),
    ],
    compareKeys: ["kyc", "api", "mobile_app", "productSummary", "regulatorySummary"],
  },
];

export const VERIFICATION_STATES = ["needs_review", "imported", "manual", "verified", "stale", "missing"] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

export function isPlatformKind(value: string): value is PlatformKind {
  return (PLATFORM_KIND_IDS as readonly string[]).includes(value);
}

export function catalogById(id?: string | null) {
  return CATALOG.find((item) => item.id === id) || null;
}

export function catalogByHub(hub?: string | null) {
  return CATALOG.find((item) => item.hub === hub) || null;
}

export function platformPath(kind: string, slug?: string) {
  const cat = catalogById(kind);
  const hub = cat?.hub || `${kind}s`;
  return slug ? `/${hub}/${slug}` : `/${hub}`;
}

export function unknownLabel(value?: string | null) {
  const v = String(value || "").trim();
  return v || "Not disclosed";
}

export function classifyKindFromPublicText(input: { title?: string; description?: string; host?: string }) {
  const blob = `${input.title || ""} ${input.description || ""} ${input.host || ""}`.toLowerCase();
  const rules: Array<[PlatformKind, RegExp]> = [
    ["dex", /\b(dex|amm|uniswap|swap protocol|on-chain order)\b/],
    ["wallet", /\b(wallet|self-custod|hardware wallet|seed phrase|browser extension)\b/],
    ["crypto-card", /\b(crypto card|debit card|visa card|mastercard)\b/],
    ["onramp", /\b(on-?ramp|off-?ramp|buy crypto|sell crypto|moonpay)\b/],
    ["staking", /\b(liquid staking|staking protocol|earn yield)\b/],
    ["defi", /\b(defi|lending protocol|liquidity pool)\b/],
    ["broker", /\b(forex|cfd broker|mt4|mt5|spread betting)\b/],
    ["trading-platform", /\b(trading terminal|tradingview|copy trading)\b/],
    ["explorer", /\b(block explorer|blockchain explorer|tx hash|etherscan)\b/],
    ["tax", /\b(crypto tax|tax software|capital gains report|accounting for crypto)\b/],
    ["tool", /\b(portfolio tracker|trading bot|analytics dashboard|market data)\b/],
    ["exchange", /\b(crypto exchange|spot trading|centralized exchange|cex)\b/],
  ];
  for (const [kind, pattern] of rules) {
    if (pattern.test(blob)) return { kind, confidence: "low" as const, status: "needs_review" as const };
  }
  return { kind: null, confidence: "low" as const, status: "needs_review" as const };
}
