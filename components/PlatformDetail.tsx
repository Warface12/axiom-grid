import Link from "next/link";
import { ExternalLink, Globe2, ShieldCheck } from "lucide-react";
import type { Platform } from "@/lib/types";
import { platformMarketDecision } from "@/lib/marketVisibility";
import { getPublicPlatforms, hrefFor } from "@/lib/platforms";
import { SITE_URL } from "@/lib/site";
import { catalogById, unknownLabel } from "@/lib/catalog";
import { SaveFollowControls } from "@/components/SaveFollowControls";

function attrLabel(platform: Platform, key: string) {
  const spec = catalogById(platform.kind)?.attributes.find((item) => item.key === key);
  return spec?.label || key;
}

function attrValue(platform: Platform, key: string) {
  const raw = platform.attributes?.[key];
  if (raw === true) return "Yes";
  if (raw === false) return "No";
  if (typeof raw === "string" && raw.trim()) return raw;
  return "Not disclosed";
}

export async function PlatformDetail({ platform }: { platform: Platform }) {
  const cat = catalogById(platform.kind);
  const decision = platform.id ? await platformMarketDecision(platform.id) : null;
  const promotional = Boolean(platform.affiliateUrl) && Boolean(platform.id) && Boolean(decision?.commercial);
  const related = (await getPublicPlatforms(platform.kind, 8)).filter((item) => item.slug !== platform.slug).slice(0, 3);
  const hub = cat ? `/${cat.hub}` : hrefFor(platform).split("/").slice(0, 2).join("/");
  const attrKeys = (cat?.attributes || []).map((item) => item.key).filter((key) => platform.attributes?.[key] != null && platform.attributes?.[key] !== "");

  return (
    <div className="shell content-shell detail-grid">
      <article className="detail-main">
        <nav className="tp-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={hub}>{cat?.plural || platform.kind}</Link>
          <span>/</span>
          <span>{platform.name}</span>
        </nav>
        <span className="kind-label">{cat?.label || platform.kind} / RESEARCH PROFILE</span>
        <h1>{platform.name}</h1>
        <p className="page-lead">{platform.description || "An editorial review has not been published for this profile yet."}</p>
        <div className="notice">
          <ShieldCheck size={18} /> TopPick.pro publishes research, not personal financial advice. Product access, legal entity, protections, fees and promotional eligibility can vary by jurisdiction. Fields without a source stay empty.
        </div>
        {platform.productSummary ? <><h2>What it is</h2><p>{platform.productSummary}</p></> : null}
        {platform.feeSummary ? <><h2>What it costs</h2><p>{platform.feeSummary}</p></> : null}
        {platform.securitySummary ? <><h2>Security & custody</h2><p>{platform.securitySummary}</p></> : null}
        <h2>Where it is available</h2>
        <p>{platform.productNote || "No verified market-availability note has been published. Unknown is not treated as available."}</p>
        {attrKeys.length ? (
          <>
            <h2>Published feature notes</h2>
            <ul>{attrKeys.map((key) => <li key={key}><strong>{attrLabel(platform, key)}:</strong> {attrValue(platform, key)}</li>)}</ul>
          </>
        ) : null}
        {platform.riskNotes ? <><h2>Risk notes</h2><p>{platform.riskNotes}</p></> : null}
        {platform.screenshots?.length ? (
          <>
            <h2>Editor-uploaded screenshots</h2>
            <div className="tp-shot-grid">
              {platform.screenshots.map((src) => (
                <figure key={src}><img src={src} alt={`Editorial screenshot for ${platform.name}`} width={640} height={360} /></figure>
              ))}
            </div>
          </>
        ) : null}
        {platform.pros?.length ? <><h2>Research highlights</h2><ul>{platform.pros.map((x) => <li key={x}>{x}</li>)}</ul></> : null}
        {platform.cons?.length ? <><h2>Limitations</h2><ul>{platform.cons.map((x) => <li key={x}>{x}</li>)}</ul></> : null}
        <h2>Editorial & affiliate disclosure</h2>
        <p>If a partner link is shown, TopPick.pro may receive compensation. Compensation is not a ranking claim and does not mean the product is available in every market. Official-site links are not affiliate destinations unless a stored partner URL is used.</p>
        <div className="tag-row">{platform.tags.map((t) => <span key={t}>{t}</span>)}</div>
        <SaveFollowControls platformId={platform.id} slug={platform.slug} kind={platform.kind} />
        {related.length > 0 && (
          <section className="tp-related">
            <h2>Related {cat?.plural || "profiles"}</h2>
            <div className="tp-related-links">
              {related.map((item) => (
                <Link key={item.slug} href={hrefFor(item)}>{item.name}</Link>
              ))}
              <Link href={`/compare?ids=${[platform.id || platform.slug, ...related.map((item) => item.id || item.slug)].slice(0, 3).join(",")}`}>Compare nearby profiles</Link>
            </div>
          </section>
        )}
      </article>
      <aside className="detail-side">
        {platform.logoUrl ? (
          <span className="platform-logo platform-logo-image detail-logo">
            <img src={platform.logoUrl} alt="" width={64} height={64} />
          </span>
        ) : (
          <span className={`platform-logo logo-${platform.kind}`} aria-hidden="true">{platform.logoText}</span>
        )}
        <h3>{platform.name}</h3>
        <dl>
          <div><dt>Product type</dt><dd>{cat?.label || platform.kind}</dd></div>
          {platform.subcategory ? <div><dt>Subcategory</dt><dd>{platform.subcategory}</dd></div> : null}
          <div><dt>Research status</dt><dd>{platform.status}</dd></div>
          <div><dt>Data quality</dt><dd>{platform.verificationStatus || "needs_review"}</dd></div>
          <div><dt>Custody</dt><dd>{unknownLabel(platform.custody)}</dd></div>
          <div><dt>Last record update</dt><dd>{platform.updatedAt || "Not recorded"}</dd></div>
          <div><dt>Last verified</dt><dd>{platform.lastVerifiedAt ? platform.lastVerifiedAt.slice(0, 10) : "Not verified"}</dd></div>
          {platform.editorialScore != null && Number.isFinite(platform.editorialScore) ? <div><dt>Editorial score</dt><dd>{platform.editorialScore}</dd></div> : <div><dt>Editorial score</dt><dd>Not rated</dd></div>}
          {decision && <div><dt>Current market</dt><dd>{decision.country || "Unverified"}</dd></div>}
        </dl>
        {decision && (
          <div className={`tp-market-decision ${decision.visible ? "is-open" : "is-closed"}`}>
            <Globe2 />
            <span>
              <b>{decision.visible ? "Research visibility approved" : "Not available for this market"}</b>
              <small>{decision.reason}</small>
            </span>
          </div>
        )}
        {platform.website ? (
          <Link className="btn-ghost" href={platform.website} target="_blank" rel="nofollow noopener">Official website <ExternalLink size={15} /></Link>
        ) : null}
        {promotional && (
          <Link className="primary-btn partner-cta" href={`/go/${platform.id}?placement=profile&cta=partner`} target="_blank" rel="sponsored nofollow noopener">{platform.ctaLabel || "Open partner site"} <ExternalLink size={15} /></Link>
        )}
        {decision?.visible && !decision.commercial && (
          <small className="affiliate-note">Research is available in this market, but no approved partner destination is configured.</small>
        )}
        <small className="affiliate-note">Canonical profile: {SITE_URL}{hrefFor(platform)}</small>
      </aside>
    </div>
  );
}
