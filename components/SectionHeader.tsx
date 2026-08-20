import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function SectionHeader({eyebrow,title,copy,href,label}:{eyebrow:string;title:string;copy?:string;href?:string;label?:string}){return <div className="section-head"><div><span>{eyebrow}</span><h2>{title}</h2>{copy?<p>{copy}</p>:null}</div>{href?<Link href={href}>{label||"View all"}<ArrowRight size={15}/></Link>:null}</div>}
