import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Guide } from "@/lib/types";
export function GuideCard({guide}:{guide:Guide}){return <article className="guide-card"><div><span>{guide.category}</span><small>{guide.readTime}</small></div><h3>{guide.title}</h3><p>{guide.excerpt}</p><Link href={`/learn/${guide.slug}`}>Read guide <ArrowRight size={14}/></Link></article>}
