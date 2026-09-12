import type { Guide } from "@/lib/types";

export type GuideArticle = Guide & { body: { heading: string; paragraphs: string[] }[] };

export const guides: GuideArticle[] = [
  {
    slug: "how-to-choose-a-crypto-exchange",
    title: "How to choose a crypto exchange",
    excerpt: "A practical framework for comparing security, fees, funding, product access and jurisdiction.",
    category: "exchanges",
    readTime: "8 min",
    body: [
      { heading: "Separate the product from the marketing", paragraphs: [
        "A crypto exchange is a venue that matches or fills orders in digital assets and usually also holds customer funds. Compare it as a custody-plus-market-access product, not as a generic “trading app”.",
        "Start with the legal entity named in the terms, the markets it actually onboards, and whether you would be a customer of that entity. Do not infer availability from a global homepage or from an affiliate advertisement.",
      ]},
      { heading: "What to verify before opening an account", paragraphs: [
        "Identity: official domain, operating entity, and whether the product is an exchange, broker wrapper, or hybrid.",
        "Custody: who holds assets, how withdrawals work, and what happens during an outage. If the operator does not publish a current custody or proof-of-reserves statement, treat that as missing evidence rather than a positive.",
        "Cost: maker/taker fees, spreads, deposit and withdrawal fees, and conversion fees. A headline “zero fee” claim is incomplete until spread and funding costs are visible.",
        "Jurisdiction: onboarding rules, product restrictions, and whether promotional activity is allowed in your market. TopPick.pro keeps research visibility and partner CTAs as separate decisions.",
      ]},
    ],
  },
  {
    slug: "exchange-vs-wallet",
    title: "Crypto exchange vs wallet",
    excerpt: "Understand custody, control of private keys, convenience and the different risk profiles.",
    category: "wallets",
    readTime: "7 min",
    body: [
      { heading: "Different jobs, different failures", paragraphs: [
        "An exchange is built for matching, liquidity and account-level onboarding. A wallet is built for holding keys or instructing transactions. Mixing the two in one comparison hides the main risk: who can move the asset without you.",
        "Self-custody wallets give you recovery responsibility. Custodial wallets and exchange balances give the operator operational and counterparty responsibility. Neither model is universally safer; they fail in different ways.",
      ]},
      { heading: "A working decision rule", paragraphs: [
        "If you need frequent conversion, fiat ramps or order types, an exchange account may be the operational fit — provided you accept venue risk and only keep what you intend to trade.",
        "If you need long-term control of keys, a wallet with a documented recovery path is the relevant product. Compare seed/backup design, device security, supported assets and the vendor’s update process rather than bonus-style marketing.",
      ]},
    ],
  },
  {
    slug: "broker-vs-exchange",
    title: "Broker vs crypto exchange",
    excerpt: "The structural differences between trading through a broker and trading on a digital-asset exchange.",
    category: "brokers",
    readTime: "9 min",
    body: [
      { heading: "Execution and ownership are not the same", paragraphs: [
        "A broker typically offers contracts, CFDs or other derivatives referenced to an underlying market. You may have exposure to price movement without holding the underlying asset.",
        "A spot crypto exchange typically credits an account balance in the traded asset, subject to the venue’s custody, withdrawal and terms. Treating both as “trading platforms” hides leverage, expiry, entity and client-money differences.",
      ]},
      { heading: "Compare within the product class", paragraphs: [
        "For brokers: legal entity, product permissions, margin rules, negative-balance treatment where published, and whether the account is available in your market.",
        "For exchanges: listed assets, fee schedule, funding rails, wallet/withdrawal controls and operational disclosures. TopPick.pro keeps these directories separate so the comparison stays honest.",
      ]},
    ],
  },
  {
    slug: "crypto-fees-explained",
    title: "Crypto fees explained",
    excerpt: "Maker/taker fees, spreads, funding charges and withdrawals — what to compare before signing up.",
    category: "learn",
    readTime: "10 min",
    body: [
      { heading: "The fee you see is rarely the whole cost", paragraphs: [
        "Published maker/taker schedules are a starting point, not a total cost of trading. Spread, conversion, funding, withdrawal network fees and inactivity charges can dominate for smaller accounts.",
        "If a page does not show a current fee schedule from the operator, TopPick.pro will not invent one. Missing cost data is shown as unpublished rather than estimated.",
      ]},
      { heading: "A simple comparison checklist", paragraphs: [
        "Spot vs derivatives: funding and overnight costs only apply where the product uses them.",
        "Fiat ramps: deposit and payout fees can exceed trading fees.",
        "Network withdrawals: on-chain fees vary and are not controlled by comparison publishers.",
        "Account tiers: volume discounts are operator-specific; do not assume a public VIP schedule applies to you.",
      ]},
    ],
  },
  {
    slug: "self-custody-basics",
    title: "Self-custody basics",
    excerpt: "Seed phrases, hot vs cold wallets and practical security habits for beginners.",
    category: "wallets",
    readTime: "11 min",
    body: [
      { heading: "Control means responsibility", paragraphs: [
        "Self-custody means you (or your device) can authorize transfers. That removes exchange counterparty risk and introduces backup, phishing and device-compromise risk.",
        "A seed phrase or recovery kit is not a password to reset. Anyone who copies it can move assets. Store it offline, never in screenshots, email or chat.",
      ]},
      { heading: "Hot, cold and vendor updates", paragraphs: [
        "Hot wallets stay connected and are convenient for smaller operational balances. Cold or hardware wallets keep keys off general-purpose computers, which reduces some malware paths but does not remove physical-loss or supply-chain questions.",
        "Compare vendor documentation, firmware update process, supported assets and recovery design. Do not treat a wallet review as a guarantee that a device is free of defects.",
      ]},
    ],
  },
  {
    slug: "how-we-rate-platforms",
    title: "How our platform scoring works",
    excerpt: "A transparent evidence-first methodology for exchanges, brokers and wallets.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "Evidence before promotion", paragraphs: [
        "TopPick.pro does not publish a synthetic star rating unless an editorial score is stored against a reviewed record. Missing scores are omitted rather than filled with placeholders.",
        "Each public profile is expected to separate identity, product scope, cost, security or custody, regulatory context, evidence freshness and market eligibility. A partner relationship never proves that a product is available in a visitor’s country.",
      ]},
      { heading: "Fail-closed commercial routing", paragraphs: [
        "Affiliate buttons stay disabled unless an approved, unexpired market rule allows both product availability and commercial promotion.",
        "SEO automation may recommend snippet or internal-linking improvements. It does not auto-publish factual claims, bonuses or licenses.",
      ]},
    ],
  },
  {
    slug: "how-to-read-a-bridge",
    title: "How to read a cross-chain bridge",
    excerpt: "In-flight custody, published chains and what happens when a message fails.",
    category: "learn",
    readTime: "8 min",
    body: [
      { heading: "A bridge is not a wallet", paragraphs: [
        "While assets move between chains they are often locked, minted or routed through a liquidity pool. That is a custody event, even if both endpoints look like self-custody wallets.",
        "Compare the published chains, the lock or mint design, and what the operator says happens if a relayer or validator set stalls. Speed and TVL claims stay empty on TopPick unless a current source exists.",
      ]},
      { heading: "Failure modes to keep separate", paragraphs: [
        "Smart-contract risk, operator-set risk, and destination-chain halt risk are different. A single “secure bridge” label hides which one you are taking.",
        "If the product page does not name the mechanism, treat the custody field as unpublished rather than assuming canonical or lock-and-mint.",
      ]},
    ],
  },
  {
    slug: "lending-and-liquidation",
    title: "Crypto lending and liquidation",
    excerpt: "Collateral, who can seize it, and why a headline APY is not a comparison.",
    category: "learn",
    readTime: "7 min",
    body: [
      { heading: "You are comparing a liquidation machine", paragraphs: [
        "A lending market is a ruleset for posting collateral and seizing it. The interesting facts are the asset held, the oracle used, and the liquidation path — not a promotional supply rate.",
        "TopPick shows APY only when a sourced, dated figure exists. Missing rates stay blank.",
      ]},
      { heading: "Custodial earn is a different product", paragraphs: [
        "An exchange earn or savings product is usually an unsecured or custodial claim on the operator. Do not compare it in the same table as an on-chain money market.",
        "Use the savings niche for operator earn books and the lending niche for protocol markets.",
      ]},
    ],
  },
  {
    slug: "what-is-restaking",
    title: "What restaking actually adds",
    excerpt: "Shared security, extra slashing and why points are not yield.",
    category: "learn",
    readTime: "7 min",
    body: [
      { heading: "You are extending slashable risk", paragraphs: [
        "Restaking uses already-staked assets to secure extra services. The new product is the extra slashing condition and the operator set — not a points dashboard.",
        "Compare the base asset, the published undelegate or lockup path, and who can trigger a slash. TopPick will not invent a restaking APY.",
      ]},
    ],
  },
  {
    slug: "stablecoins-and-redemption",
    title: "Stablecoins and redemption",
    excerpt: "Reserves, who can redeem, and why a peg chart is not research.",
    category: "learn",
    readTime: "8 min",
    body: [
      { heading: "The issuer is the product", paragraphs: [
        "A stablecoin is a claim design. Compare the published reserves, the redemption desk, and the markets where redemption is actually offered.",
        "TopPick does not draw a live peg tape. If redemption is unpublished, the field stays empty.",
      ]},
    ],
  },
  {
    slug: "options-vs-futures",
    title: "Options vs futures",
    excerpt: "Expiry, premium and why these are not the same as a spot exchange balance.",
    category: "learn",
    readTime: "7 min",
    body: [
      { heading: "Different contracts, different failures", paragraphs: [
        "A perpetual or dated future is usually a linear or inverse contract with funding or expiry. An option is a right, typically paid for with premium, that can expire worthless.",
        "Compare them inside their own class. Do not drop both into a generic “trading platform” table next to a spot wallet.",
      ]},
      { heading: "What TopPick will not invent", paragraphs: [
        "Greeks, implied volatility and live funding are not simulated here. If the operator does not publish contract specs, the field stays empty.",
      ]},
    ],
  },
  {
    slug: "how-to-read-a-prediction-market",
    title: "How to read a prediction market",
    excerpt: "Resolution source, custody of stakes and why odds are not a live tape.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "The resolution rule is the product", paragraphs: [
        "A prediction market prices an event. The useful facts are who decides the outcome, who holds the stake, and who is allowed to participate.",
        "TopPick does not draw a live odds tape. If resolution is unpublished, treat the market as incomplete research.",
      ]},
    ],
  },
  {
    slug: "how-to-read-a-crypto-etf",
    title: "How to read a crypto ETF",
    excerpt: "Issuer, custody of the underlying, and why the share is not the token.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "You are buying a listed claim", paragraphs: [
        "A crypto ETF or ETP is a share. Compare the issuer, the custodian of the underlying, the fee as published, and the market where the share trades.",
        "Do not treat the ETF page as a spot token page. Creation, redemption and brokerage access are operator-specific.",
      ]},
    ],
  },
  {
    slug: "privacy-tools-without-the-myth",
    title: "Privacy tools without the myth",
    excerpt: "What a privacy wallet actually changes, and what TopPick will not help you do.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "Mechanics, not evasion", paragraphs: [
        "A privacy wallet or shielded pool changes who can see a transfer. It does not remove legal duties. TopPick compares published mechanics and will not help anyone evade the law.",
        "If the operator does not publish the mechanism, the field stays empty.",
      ]},
    ],
  },
  {
    slug: "how-to-read-a-crypto-index",
    title: "How to read a crypto index",
    excerpt: "Methodology, constituents and who holds the basket.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "The rule is the product", paragraphs: [
        "An index is a published recipe. Compare the constituents, the rebalance rule and who holds the assets. A ticker is not a methodology.",
        "TopPick does not draw a live index level. If the rule is unpublished, the field stays empty.",
      ]},
    ],
  },
  {
    slug: "structured-products-without-the-diagram",
    title: "Structured products without the diagram",
    excerpt: "Tenor, knockout and why a pretty payoff sketch is not research.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "Read the tenor and the knockout", paragraphs: [
        "A dual or barrier note is a contract. Compare the tenor, the knockout, and who holds the notional. TopPick will not invent a payoff diagram.",
        "If the operator does not publish those terms, treat the product as incomplete research.",
      ]},
    ],
  },
  {
    slug: "how-to-read-an-otc-desk",
    title: "How to read an OTC desk",
    excerpt: "Settlement, inventory custody and why a quoted spread is not a live tape.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "A desk is not an order book", paragraphs: [
        "An OTC desk negotiates a block. Compare who holds the inventory, how settlement works, and the published minimum. A chat quote is not a public market.",
        "TopPick will not invent a spread. If the desk does not publish terms, the field stays empty.",
      ]},
    ],
  },
  {
    slug: "portfolio-trackers-without-the-balance",
    title: "Portfolio trackers without the balance",
    excerpt: "Imports, custody of API keys, and why TopPick never draws your holdings.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "The import is the product", paragraphs: [
        "A tracker is only as good as the venues it can import and the keys it asks for. Compare read-only access, export formats and who can see the list.",
        "TopPick does not simulate balances or PnL. If a connector is unpublished, treat coverage as missing.",
      ]},
    ],
  },
  {
    slug: "trading-bots-and-where-keys-live",
    title: "Trading bots and where keys live",
    excerpt: "Grid and DCA products fail first on custody of exchange keys, not on a backtest.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "The bot is a key holder", paragraphs: [
        "A grid or DCA bot is an agent with venue access. Compare where the API key lives, which permissions it needs, and whether the operator can move funds.",
        "Backtests and live PnL screenshots are marketing. TopPick will not invent them.",
      ]},
    ],
  },
  {
    slug: "crypto-payroll-is-still-custody",
    title: "Crypto payroll is still custody",
    excerpt: "Who holds the float, and why tax treatment is never inferred.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "Float is the product", paragraphs: [
        "A payroll rail holds value between the company and the contractor. Compare who holds that float, which assets settle, and the published markets.",
        "TopPick will not infer tax treatment from a homepage. If the operator does not publish it, the cell stays empty.",
      ]},
    ],
  },
  {
    slug: "forex-is-still-a-wrapper",
    title: "Forex is still a wrapper",
    excerpt: "An FX homepage can still be a CFD. Compare the entity and published leverage.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "Name the contract", paragraphs: [
        "A forex venue may offer spot FX, an NDF or a CFD wrapper. Those are different products. Compare the legal entity and the published leverage.",
        "Spreads on TopPick stay empty unless the operator publishes them. A moving quote widget is not research.",
      ]},
    ],
  },
  {
    slug: "prop-firms-without-the-pass-rate",
    title: "Prop firms without the pass-rate",
    excerpt: "Published rules and who holds the balance. Challenge statistics are marketing.",
    category: "learn",
    readTime: "6 min",
    body: [
      { heading: "The rulebook is the product", paragraphs: [
        "A prop evaluation is a contract. Compare the published rules, the payout terms, and who holds the trading balance while you are evaluated.",
        "Pass-rates and leaderboards are not evidence on TopPick. If the operator does not publish the rule, the field stays empty.",
      ]},
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug) || null;
}
