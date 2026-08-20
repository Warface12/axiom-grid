import Link from "next/link";
import { Check, CircleDollarSign, Clock3, ExternalLink, Globe2, Languages, ListChecks, ShieldCheck, Sparkles, Star, WalletCards, X } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CasinoOfferPanel } from "@/components/CasinoOfferPanel";
import { PromoCodeCopy } from "@/components/PromoCodeCopy";
import { getCasinoBySlug, getBonusesByCasino, getPromoCodesByCasino, getCasinoEvidence, getCasinoChangeHistory } from "@/lib/data";
import { buildMetadata, casinoReviewJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate, formatRating, SITE_URL } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
const list = (value: unknown): string[] => Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && Boolean(x.trim())).map((x) => x.trim()) : [];
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params; const casino = await getCasinoBySlug(slug);
  if (!casino) return buildMetadata({ title: "Casino Not Found", noIndex: true });
  return buildMetadata({ title: text(casino.seo_title) || `${casino.name} Review, Bonuses & Details — NivaroBet`, description: text(casino.seo_description) || text(casino.description) || `Explore ${casino.name} bonuses, payments, licensing, availability and review details on NivaroBet.`, path: `/casinos/${slug}`, ogImage: casino.logo_url || undefined });
}

function Fact({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return <div className="quick-fact"><span>{label}</span><strong>{value}</strong></div>;
}

export default async function CasinoProfilePage({ params }: Props) {
  const { slug } = await params; const casino = await getCasinoBySlug(slug); if (!casino) notFound();
  const [bonuses, promoCodes, evidence, changes] = await Promise.all([
    getBonusesByCasino(casino.id),
    getPromoCodesByCasino(casino.id),
    getCasinoEvidence(casino.id),
    getCasinoChangeHistory(casino.id),
  ]);
  const pros = list(casino.pros), cons = list(casino.cons), games = list(casino.games), providers = list(casino.providers), payments = list(casino.payment_methods), countries = list(casino.country_codes), currencies = list(casino.currencies), languages = list(casino.languages);
  const marketGate = Array.isArray((casino as any).market_compliance) ? (casino as any).market_compliance[0] : null;
  const marketApproved = Boolean(marketGate && marketGate.status === "approved" && marketGate.listing_allowed === true);
  const ratingBreakdown = casino.rating_breakdown && typeof casino.rating_breakdown === "object" ? casino.rating_breakdown : {};
  const hasRating = Number(casino.rating) > 0;
  const hasAffiliate = Boolean(casino.affiliate_url?.trim()) && (!marketGate || marketGate.affiliate_cta_allowed === true);
  const bonusSummaryAllowed = !marketGate || marketGate.bonus_public_advertising_allowed === true;
  const marketConfidence = marketGate ? Number(marketGate.evidence_confidence || 0) : null;

  return <main className="container page casino-profile-page">
    {hasRating ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(casinoReviewJsonLd(casino)) }} /> : null}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{name:"Home",url:SITE_URL},{name:"Casinos",url:`${SITE_URL}/casinos`},{name:casino.name,url:`${SITE_URL}/casinos/${slug}`}])) }} />
    <Breadcrumbs items={[{label:"Home",href:"/"},{label:"Casinos",href:"/casinos"},{label:casino.name}]} />

    <section className="profile-hero profile-hero-3d">
      <div className="profile-head">
        <div className="casino-logo lg">{casino.logo_url ? <img src={casino.logo_url} alt={`${casino.name} logo`} width={76} height={76}/> : <span>{casino.name.charAt(0)}</span>}</div>
        <div><span className="eyebrow">CASINO REVIEW</span><h1>{casino.name}</h1><div className="profile-signal-row">{hasRating ? <span className="rating lg"><Star size={16} fill="currentColor"/>{formatRating(casino.rating)}/10</span> : null}{marketApproved ? <span className="verified"><ShieldCheck size={14}/> Market eligible</span> : <span className="pending-badge">Owner preview</span>}{marketGate?.last_checked_at ? <span className="last-checked"><Clock3 size={14}/>Market check {formatDate(marketGate.last_checked_at)}</span> : null}</div></div>
      </div>
      {hasAffiliate ? <Link className="primary-btn" href={`/go/${casino.id}?source=/casinos/${slug}`}>Visit Casino <ExternalLink size={15}/></Link> : null}
    </section>

    <nav className="casino-toc" aria-label="Review contents">
      <span><ListChecks size={14}/> On this page</span>
      {bonuses.length || promoCodes.length ? <a href="#offers">Offers</a> : null}
      {text(casino.description) || text(casino.review_content) ? <a href="#review">Review</a> : null}
      {payments.length || casino.min_deposit || casino.payout_speed || casino.withdrawal_limits || casino.withdrawal_info ? <a href="#payments">Payments</a> : null}
      {casino.license_info || casino.license_authority || casino.license_number || casino.owner_name || casino.founded_year ? <a href="#license">License</a> : null}
      {countries.length || currencies.length || languages.length ? <a href="#availability">Availability</a> : null}
      {evidence.length ? <a href="#evidence">Evidence</a> : null}
      {changes.length ? <a href="#changes">Changes</a> : null}
    </nav>

    {bonuses.length > 0 ? <section id="offers" className="profile-section"><div className="section-heading"><div><span className="eyebrow"><Sparkles size={14}/> CURRENT OFFERS</span><h2>Bonuses & promotions</h2></div></div><div className="casino-offer-list">{bonuses.map((bonus)=><CasinoOfferPanel key={bonus.id} bonus={bonus} affiliateHref={hasAffiliate ? `/go/${casino.id}?source=/casinos/${slug}&offer=${bonus.id}` : null}/>)}</div></section> : null}

    {promoCodes.length > 0 ? <section id={bonuses.length ? undefined : "offers"} className="profile-section"><div className="section-heading"><div><span className="eyebrow"><Sparkles size={14}/> PROMO CODES</span><h2>Codes & no-deposit offers</h2></div></div><div className="promo-grid">{promoCodes.map((promo)=><article className="promo-card promo-card-premium" key={promo.id}><div><small>{promo.promo_type || (promo.no_deposit ? "NO DEPOSIT" : "PROMO CODE")}</small><h3>{promo.title}</h3>{promo.bonus_text ? <p>{promo.bonus_text}</p> : null}</div>{promo.code ? <PromoCodeCopy code={promo.code}/> : null}<div className="promo-meta">{promo.wagering_requirement ? <span>Wagering: {promo.wagering_requirement}</span> : null}{promo.min_deposit ? <span>Min deposit: {promo.min_deposit}</span> : null}{promo.max_cashout ? <span>Max cashout: {promo.max_cashout}</span> : null}</div>{promo.terms ? <p className="casino-offer-terms">{promo.terms}</p> : null}<div className="promo-card-footer">{promo.verified_at ? <span>Verified {formatDate(promo.verified_at)}</span> : null}{hasAffiliate ? <Link className="primary-btn compact" href={`/go/${casino.id}?source=/casinos/${slug}&promo=${promo.id}`}>Use offer <ExternalLink size={13}/></Link> : null}</div></article>)}</div></section> : null}

    <div className="profile-grid">
      <section className="profile-main">
        {text(casino.description) || text(casino.review_content) ? <section id="review" className="profile-section"><h2>Overview</h2>{text(casino.description) ? <p className="review-lead">{casino.description}</p> : null}{text(casino.review_content) ? <div className="review-copy">{casino.review_content}</div> : null}</section> : null}

        {pros.length || cons.length ? <section className="profile-section"><div className="pros-cons">{pros.length ? <div><h3>Pros</h3><ul>{pros.map((item)=><li key={item}><Check size={14}/>{item}</li>)}</ul></div> : null}{cons.length ? <div><h3>Cons</h3><ul>{cons.map((item)=><li key={item}><X size={14}/>{item}</li>)}</ul></div> : null}</div></section> : null}

        {Object.keys(ratingBreakdown).length > 0 ? <section className="profile-section"><h2>Rating breakdown</h2><div className="rating-breakdown">{Object.entries(ratingBreakdown).map(([key,value]) => <div key={key}><span>{key.replaceAll("_"," ")}</span><strong>{Number(value).toFixed(1)}/10</strong><div><i style={{width:`${Math.max(0,Math.min(100,Number(value)*10))}%`}}/></div></div>)}</div></section> : null}

        {games.length || providers.length ? <section className="profile-section"><h2>Games & providers</h2>{games.length ? <div className="tag-row">{games.map((game)=><span key={game}>{game}</span>)}</div> : null}{providers.length ? <div className="tag-row spaced">{providers.map((provider)=><span key={provider}>{provider}</span>)}</div> : null}</section> : null}

        {payments.length || casino.min_deposit || casino.payout_speed || casino.withdrawal_limits || casino.withdrawal_info ? <section id="payments" className="profile-section"><h2>Payments & withdrawals</h2>{payments.length ? <div className="tag-row">{payments.map((method)=><span key={method}>{method}</span>)}</div> : null}<div className="fact-grid"><Fact label="Minimum deposit" value={casino.min_deposit}/><Fact label="Payout speed" value={casino.payout_speed}/><Fact label="Withdrawal limits" value={casino.withdrawal_limits}/><Fact label="Withdrawal details" value={casino.withdrawal_info}/></div></section> : null}

        {casino.license_info || casino.license_authority || casino.license_number || casino.owner_name || casino.founded_year ? <section id="license" className="profile-section"><h2>Licensing & operator</h2><div className="fact-grid"><Fact label="License" value={casino.license_info}/><Fact label="Authority" value={casino.license_authority}/><Fact label="License number" value={casino.license_number}/><Fact label="Operator" value={casino.owner_name}/><Fact label="Founded" value={casino.founded_year}/></div></section> : null}

        {countries.length || currencies.length || languages.length ? <section id="availability" className="profile-section"><h2>Availability</h2><div className="fact-icon-row">{countries.length ? <div><Globe2/><span>Countries</span><strong>{countries.join(", ")}</strong></div> : null}{languages.length ? <div><Languages/><span>Languages</span><strong>{languages.join(", ")}</strong></div> : null}{currencies.length ? <div><CircleDollarSign/><span>Currencies</span><strong>{currencies.join(", ")}</strong></div> : null}</div></section> : null}


        {evidence.length ? <section id="evidence" className="profile-section"><div className="section-heading"><div><span className="eyebrow">NIVARO EVIDENCE</span><h2>Why this profile is shown</h2></div>{marketConfidence !== null ? <span className="confidence-pill">Confidence {marketConfidence.toFixed(0)}%</span> : null}</div><div className="evidence-list">{evidence.slice(0,12).map((item:any)=><article className="evidence-row" key={item.id}><div><strong>{item.source_title || item.source_kind}</strong><span>{item.evidence_type}{item.market_code ? ` · ${item.market_code}` : ""}</span></div><div><span>{item.status}</span><span>{Number(item.confidence||0).toFixed(0)}%</span><span>{item.checked_at ? formatDate(item.checked_at) : ""}</span></div><a href={item.source_url} target="_blank" rel="noreferrer">Source ↗</a></article>)}</div></section> : null}

        {changes.length ? <section id="changes" className="profile-section"><div className="section-heading"><div><span className="eyebrow">CHANGE INTELLIGENCE</span><h2>Recent monitored changes</h2></div></div><div className="change-list">{changes.slice(0,12).map((item:any)=><article className="change-row" key={item.id}><div><strong>{String(item.field_name || item.entity_type).replaceAll("_"," ")}</strong><span>{item.detected_at ? formatDate(item.detected_at) : ""}</span></div><span>{item.status}</span>{item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer">Evidence ↗</a> : null}</article>)}</div></section> : null}

        {text(casino.final_verdict) ? <section className="profile-section final-verdict"><h2>Final verdict</h2><p>{casino.final_verdict}</p></section> : null}
        <div className="notice"><strong>Responsible Gambling</strong><p>Gambling can be addictive. Play responsibly, use limits and verify local rules before playing. 18+ only.</p></div>
      </section>

      <aside className="profile-sidebar"><div className="sidebar-card premium-sidebar"><h3>Quick facts</h3><div className="quick-facts">{bonusSummaryAllowed ? <><Fact label="Welcome bonus" value={casino.welcome_bonus}/><Fact label="No deposit" value={casino.no_deposit ? "Available" : null}/><Fact label="Free spins" value={casino.free_spins ? "Available" : null}/><Fact label="Cashback" value={casino.cashback}/></> : null}<Fact label="KYC" value={casino.kyc_required === true ? "Required" : casino.kyc_required === false ? "Not always required" : null}/><Fact label="Mobile app" value={casino.mobile_app === true ? "Available" : null}/><Fact label="Live chat" value={casino.live_chat === true ? "Available" : null}/><Fact label="VIP program" value={casino.vip_program === true ? "Available" : null}/></div></div>{hasAffiliate ? <Link className="primary-btn full" href={`/go/${casino.id}?source=/casinos/${slug}`}>Claim offer <ExternalLink size={15}/></Link> : null}<div className="sidebar-card trust-mini"><ShieldCheck/><h3>Eligibility first</h3><p>Uncertain or unsupported markets remain hidden instead of being published by default.</p><Link href="/how-we-verify">How market checks work →</Link></div></aside>
    </div>
  </main>;
}
