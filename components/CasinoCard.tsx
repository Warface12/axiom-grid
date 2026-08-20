import Link from "next/link";
import { ChevronRight, ExternalLink, Star } from "lucide-react";
import { formatRating } from "@/lib/utils";
import type { Casino } from "@/lib/types";

type Props = {
  casino: Pick<Casino, "id" | "name" | "slug" | "rating" | "welcome_bonus" | "logo_url" | "affiliate_url">;
  accent?: "red" | "violet" | "cyan";
  showCompare?: boolean;
};

export function CasinoCard({ casino, showCompare = false }: Props) {
  const rating = Number(casino.rating) > 0 ? formatRating(casino.rating) : null;
  const primaryHref = casino.affiliate_url ? `/go/${casino.id}?source=/` : `/casinos/${casino.slug}`;

  return (
    <article className="nv4-casino-card">
      <div className="nv4-card-topline" />
      <div className="nv4-card-head">
        <div className="nv4-casino-logo">
          {casino.logo_url ? <img src={casino.logo_url} alt={`${casino.name} logo`} loading="lazy" /> : <strong>{casino.name.slice(0, 2).toUpperCase()}</strong>}
        </div>
        <div className="nv4-card-rating">{rating ? <><Star size={12} fill="currentColor"/><strong>{rating}</strong></> : <span>New</span>}</div>
      </div>

      <div className="nv4-card-title">
        <h3>{casino.name}</h3>
      </div>

      <div className="nv4-card-bonus">
        <small>WELCOME OFFER</small>
        <strong>{casino.welcome_bonus || "Exclusive partner offer"}</strong>
        <span className="nv4-offer-note">See key terms before visiting</span>
      </div>

      <div className="nv4-card-actions">
        <Link className="nv4-primary-cta" href={primaryHref}>Visit casino {casino.affiliate_url ? <ExternalLink size={12}/> : <ChevronRight size={13}/>}</Link>
        <Link className="nv4-review-link" href={`/casinos/${casino.slug}`}>Trust Passport <ChevronRight size={12}/></Link>
      </div>

      {showCompare ? <label className="ref-compare"><input type="checkbox" name="compare" value={casino.id} form="compare-form"/> Compare</label> : null}
    </article>
  );
}
