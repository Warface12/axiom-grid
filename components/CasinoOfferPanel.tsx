import Link from "next/link";
import { BadgePercent, CalendarClock, CheckCircle2, ExternalLink, Gift, Sparkles } from "lucide-react";
import type { Bonus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PromoCodeCopy } from "./PromoCodeCopy";

type Props = { bonus: Bonus; affiliateHref?: string | null };

export function CasinoOfferPanel({ bonus, affiliateHref }: Props) {
  const title = bonus.title || bonus.amount || "Casino offer";
  const hasFacts = Boolean(bonus.amount || bonus.free_spins || bonus.wagering_requirement || bonus.min_deposit || bonus.max_cashout || bonus.promo_code);
  return <article className="casino-offer-card casino-offer-card-premium">
    <div className="casino-offer-top">
      <span className="casino-offer-icon">
        {bonus.casino?.logo_url ? <img src={bonus.casino.logo_url} alt={`${bonus.casino.name} logo`} width={34} height={34} loading="lazy" /> : <Gift size={20} />}
      </span>
      <div><small>{bonus.type || "BONUS"}</small><h3>{title}</h3>{bonus.casino?.name ? <span className="offer-brand-name">{bonus.casino.name}</span> : null}</div>
      {bonus.exclusive_offer ? <span className="exclusive-badge"><Sparkles size={12} /> Exclusive</span> : null}
    </div>

    {hasFacts ? <div className="casino-offer-facts">
      {bonus.amount ? <div><span>Offer</span><strong>{bonus.amount}</strong></div> : null}
      {bonus.free_spins ? <div><span>Free spins</span><strong>{bonus.free_spins}</strong></div> : null}
      {bonus.wagering_requirement ? <div><span>Wagering</span><strong>{bonus.wagering_requirement}</strong></div> : null}
      {bonus.min_deposit ? <div><span>Min deposit</span><strong>{bonus.min_deposit}</strong></div> : null}
      {bonus.max_cashout ? <div><span>Max cashout</span><strong>{bonus.max_cashout}</strong></div> : null}
      {bonus.promo_code ? <div className="offer-code-fact"><span>Promo code</span><PromoCodeCopy code={bonus.promo_code} /></div> : null}
    </div> : null}

    {bonus.terms ? <p className="casino-offer-terms">{bonus.terms}</p> : null}
    <div className="casino-offer-footer">
      <span><BadgePercent size={14} /> Terms apply</span>
      {bonus.verified_at ? <span><CheckCircle2 size={14}/> Checked {formatDate(bonus.verified_at)}</span> : null}
      {bonus.expires_at ? <span><CalendarClock size={14} /> Check expiry</span> : null}
      {bonus.terms_url ? <a href={bonus.terms_url} target="_blank" rel="noreferrer">Official T&amp;Cs</a> : null}
    </div>

    {affiliateHref ? <div className="casino-offer-actions"><Link href={affiliateHref} className="primary-btn">Visit casino <ExternalLink size={14}/></Link></div> : null}
  </article>;
}
