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

