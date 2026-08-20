import type { Guide, Platform } from "./types";

export const platforms: Platform[] = [];

export const guides: Guide[] = [
  { slug:"how-to-choose-a-crypto-exchange", title:"How to choose a crypto exchange", excerpt:"A practical framework for comparing security, fees, funding, product access and jurisdiction.", category:"exchanges", readTime:"8 min" },
  { slug:"exchange-vs-wallet", title:"Crypto exchange vs wallet", excerpt:"Understand custody, control of private keys, convenience and the different risk profiles.", category:"wallets", readTime:"7 min" },
  { slug:"broker-vs-exchange", title:"Broker vs crypto exchange", excerpt:"The structural differences between trading through a broker and trading on a digital-asset exchange.", category:"brokers", readTime:"9 min" },
  { slug:"crypto-fees-explained", title:"Crypto fees explained", excerpt:"Maker/taker fees, spreads, funding charges and withdrawals — what to compare before signing up.", category:"learn", readTime:"10 min" },
  { slug:"self-custody-basics", title:"Self-custody basics", excerpt:"Seed phrases, hot vs cold wallets and practical security habits for beginners.", category:"wallets", readTime:"11 min" },
  { slug:"how-we-rate-platforms", title:"How our platform scoring works", excerpt:"A transparent evidence-first methodology for exchanges, brokers and wallets.", category:"learn", readTime:"6 min" }
];

export const getPlatform = (slug: string) => platforms.find((p) => p.slug === slug);
