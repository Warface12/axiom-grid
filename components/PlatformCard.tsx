import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDashed, ShieldAlert } from "lucide-react";
import type { Platform } from "@/lib/types";
import { catalogById, platformPath } from "@/lib/catalog";
import { CategoryMark } from "@/components/visual/CategoryMark";

export function PlatformCard({ platform }: { platform: Platform }) {
  const Icon = platform.status === "verified" ? CheckCircle2 : platform.status === "restricted" ? ShieldAlert : CircleDashed;
  const cat = catalogById(platform.kind);
  return (
    <article className={`platform-card is-${platform.kind}`}>
      <div className="platform-top">
        {platform.logoUrl ? (
          <span className="platform-logo platform-logo-image">
            <img src={platform.logoUrl} alt={`${platform.name} logo`} width={44} height={44} />
          </span>
        ) : (
          <span className={`platform-logo logo-${platform.kind}`} aria-hidden="true">
            <CategoryMark id={platform.kind} />
            {platform.logoText}
          </span>
        )}
        <span className={`status-chip status-${platform.status}`}>
          <Icon size={13} />
          {platform.status === "research" ? "Research pending" : platform.status === "verified" ? "Reviewed" : platform.status}
        </span>
      </div>
      <div>
        <span className="kind-label">{cat?.label || platform.kind}</span>
        <h3>{platform.name}</h3>
        <p>{platform.short || "No short description has been published yet."}</p>
      </div>
      <div className="tag-row">
        {platform.custody ? <span>{platform.custody}</span> : null}
        {platform.subcategory ? <span>{platform.subcategory}</span> : null}
        {platform.tags.slice(0, 3).map((t) => <span key={t}>{t}</span>)}
      </div>
      <div className="platform-card-foot">
        <span>{platform.updatedAt ? `Updated ${platform.updatedAt}` : "Update date not recorded"}</span>
        <Link href={platformPath(platform.kind, platform.slug)}>Research profile <ArrowUpRight size={15} /></Link>
      </div>
    </article>
  );
}
