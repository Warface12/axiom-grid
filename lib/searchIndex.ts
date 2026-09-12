import {createClient} from "@supabase/supabase-js";
import {visiblePlatformIdsForVisitor} from "@/lib/marketVisibility";
import {mapPlatformRow} from "@/lib/platforms";
import type {Platform} from "@/lib/types";
import { guides } from "@/lib/guides";
import { GLOSSARY } from "@/lib/glossary";
import { CATALOG, platformPath } from "@/lib/catalog";

export type SearchHit = {
  id: string;
  title: string;
  short: string;
  kind: string;
  href: string;
};

function db(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return null;
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function searchPlatforms(q:string,limit=20):Promise<Platform[]>{
  const s=db();
  const term=q.trim();
  if(!s||term.length<2)return[];
  const {ids}=await visiblePlatformIdsForVisitor();
  if(!ids.length)return[];
  const safe=term.replace(/[,%]/g,"");
  const {data,error}=await s.from("platform").select("*").in("id",ids).eq("visible",true).neq("status","restricted").or(`name.ilike.%${safe}%,short_description.ilike.%${safe}%,product_summary.ilike.%${safe}%`).limit(limit);
  if(error)return[];
  return (data||[]).map((row)=>mapPlatformRow(row as Record<string,unknown>)).filter((p)=>!p.archived);
}

export async function searchPublic(q: string, limit = 24): Promise<SearchHit[]> {
  const term = q.trim().toLowerCase();
  if (term.length < 2) return [];
  const hits: SearchHit[] = [];
  if (term.includes("partner") || term.includes("advertis")) {
    hits.push({ id: "page-partners", title: "Partner with TopPick", short: "Apply for verified partner access. Advertising and affiliate are separate.", kind: "page", href: "/partners" });
  }
  if (term.includes("offer") || term.includes("opportun") || term.includes("airdrop") || term.includes("reward")) {
    hits.push({ id: "page-opportunities", title: "Opportunities", short: "Published offers only. Empty until real records exist.", kind: "page", href: "/opportunities" });
  }
  if (term.includes("game")) {
    hits.push({ id: "page-games", title: "TopPick games", short: "Original TopPick games stay isolated. Not third-party casino listings.", kind: "page", href: "/games" });
    hits.push({ id: "page-crypto-games", title: "Crypto games index", short: "Third-party games appear only after a reviewed record exists.", kind: "page", href: "/crypto-games" });
  }
  if (term.includes("event") || term.includes("conference") || term.includes("ama")) {
    hits.push({ id: "page-events", title: "Events", short: "Launches, AMAs and conferences — published records only.", kind: "page", href: "/events" });
  }
  if (term.includes("fee") || term.includes("maker") || term.includes("taker") || term.includes("spread")) {
    hits.push({ id: "page-fees", title: "Fees education", short: "Maker/taker, spread and withdrawals without invented numbers.", kind: "page", href: "/fees" });
  }
  if (term.includes("niche") || term.includes("categor") || term.includes("directory")) {
    hits.push({ id: "page-niches", title: "Product niches", short: "Every researched product class. Empty classes stay empty.", kind: "page", href: "/niches" });
  }
  if (term.includes("start") || term.includes("how to") || term.includes("begin")) {
    hits.push({ id: "page-start", title: "How to start", short: "Finder, compare, markets and learn — four doors.", kind: "page", href: "/start" });
  }
  if (term.includes("job") || term.includes("use case") || term.includes("i want to")) {
    hits.push({ id: "page-jobs", title: "Jobs", short: "Map a real job to a product class.", kind: "page", href: "/jobs" });
  }
  if (term.includes("faq") || term.includes("question") || term.includes("advice")) {
    hits.push({ id: "page-faq", title: "FAQ", short: "Research, markets, empty classes and accounts.", kind: "page", href: "/faq" });
  }
  if (term.includes("topic") || term.includes("guide") || term.includes("learn")) {
    hits.push({ id: "page-topics", title: "Topics", short: "Custody, fees, venues and on-chain questions.", kind: "page", href: "/topics" });
  }
  if (term.includes("research") || term.includes("method") || term.includes("finding")) {
    hits.push({ id: "page-research", title: "Research desk", short: "Streams, verification and collections. No simulated live tape.", kind: "page", href: "/research" });
  }
  if (term.includes("reward") || term.includes("bonus") || term.includes("points")) {
    hits.push({ id: "page-rewards", title: "Reward types", short: "Classify cash, crypto, credit and points before chasing an offer.", kind: "page", href: "/rewards" });
  }
  if (term.includes("secur") || term.includes("custody") || term.includes("hardware")) {
    hits.push({ id: "page-security", title: "Security & custody", short: "Who can move the asset, and how wallets differ from venues.", kind: "page", href: "/security" });
  }
  if (term.includes("account") || term.includes("watchlist") || term.includes("follow")) {
    hits.push({ id: "page-account", title: "Your account", short: "Save research and follow companies. Private — not indexed.", kind: "page", href: "/account" });
  }
  if (term.includes("install") || term.includes("pwa") || term.includes("app")) {
    hits.push({ id: "page-apps", title: "Install TopPick", short: "PWA install path. Native stores are listed only when binaries exist.", kind: "page", href: "/apps" });
  }
  if (term.includes("market") || term.includes("geo") || term.includes("country")) {
    hits.push({ id: "page-markets", title: "Markets", short: "Product availability and promotional eligibility are separate.", kind: "page", href: "/markets" });
  }
  for (const cat of CATALOG) {
    const hay = `${cat.plural} ${cat.label} ${cat.summary} ${cat.hub}`.toLowerCase();
    if (hay.includes(term)) hits.push({ id: `cat-${cat.id}`, title: cat.plural, short: cat.summary, kind: "category", href: `/${cat.hub}` });
  }
  for (const g of guides) {
    const hay = `${g.title} ${g.excerpt} ${g.category}`.toLowerCase();
    if (hay.includes(term)) hits.push({ id: `guide-${g.slug}`, title: g.title, short: g.excerpt, kind: "guide", href: `/learn/${g.slug}` });
  }
  for (const item of GLOSSARY) {
    const hay = `${item.term} ${item.definition}`.toLowerCase();
    if (hay.includes(term)) hits.push({ id: `gl-${item.slug}`, title: item.term, short: item.definition, kind: "glossary", href: `/glossary#${item.slug}` });
  }
  const platforms = await searchPlatforms(q, limit);
  for (const p of platforms) {
    hits.unshift({
      id: p.id || p.slug,
      title: p.name,
      short: p.short || "Published research profile",
      kind: p.kind,
      href: platformPath(p.kind, p.slug),
    });
  }
  return hits.slice(0, limit);
}

