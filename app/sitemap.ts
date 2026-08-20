import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
export default function sitemap():MetadataRoute.Sitemap{const paths=["/","/exchanges","/brokers","/wallets","/research","/compare","/learn","/markets","/fees","/security","/how-we-rate","/legal/privacy","/legal/terms"];return paths.map(path=>({url:`${SITE_URL}${path}`,lastModified:new Date(),changeFrequency:path==="/"?"weekly":"monthly",priority:path==="/"?1:.7}))}
