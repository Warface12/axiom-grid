import Link from "next/link";
import { ArrowRight, BookOpen, Gift, MessagesSquare, ShieldCheck, Users, WalletCards } from "lucide-react";
import type { Guide } from "@/lib/types";

const icons = [ShieldCheck, Gift, WalletCards, BookOpen, MessagesSquare, Users];

export function GuideCard({ guide }: { guide: Pick<Guide, "slug" | "title" | "excerpt" | "categories" | "featured_image_url"> }) {
  const idx = [...guide.title].reduce((a, c) => a + c.charCodeAt(0), 0) % icons.length;
  const Icon = icons[idx];
  return (
    <Link href={`/guides/${guide.slug}`} className="ref-guide-card">
      <span className="ref-guide-icon">{guide.featured_image_url ? <img src={guide.featured_image_url} alt="" loading="lazy"/> : <Icon size={24}/>}</span>
      <span className="ref-guide-copy"><strong>{guide.title}</strong><small>{guide.excerpt || guide.categories?.[0] || "Expert guide"}</small></span>
      <ArrowRight size={17} className="ref-guide-arrow"/>
    </Link>
  );
}

export function EmptyState({ title, message, actionHref, actionLabel }: { title: string; message: string; actionHref?: string; actionLabel?: string }) {
  return <div className="ref-empty"><BookOpen size={28}/><h3>{title}</h3><p>{message}</p>{actionHref && actionLabel ? <Link className="ref-signup" href={actionHref}>{actionLabel}</Link> : null}</div>;
}
