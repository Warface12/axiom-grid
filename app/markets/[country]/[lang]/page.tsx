import Link from "next/link";
import { notFound } from "next/navigation";
import { CasinoCard } from "@/components/CasinoCard";
import { getCasinos } from "@/lib/data";
import { GEO_MARKETS, getGeoMarket, getMarketCopy, isGeoLanguage, marketPath } from "@/lib/geo";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { accentFromIndex, SITE_URL } from "@/lib/utils";

 type Props = { params: Promise<{ country: string; lang: string }> };

export function generateStaticParams() {
  return GEO_MARKETS.flatMap((market) => market.languages.map((lang) => ({ country: market.code, lang: lang.code })));
}

export async function generateMetadata({ params }: Props) {
  const { country, lang } = await params;
  const market = getGeoMarket(country);
  if (!market || !isGeoLanguage(market, lang)) return buildMetadata({ title: "Market not found", noIndex: true });
  const copy = getMarketCopy(lang);
  const hasListings = market.code === "ca" ? false : (await getCasinos({ countryCode: market.code, limit: 1 })).length > 0;
  const languages = Object.fromEntries(market.languages.map((item) => [item.code, `${SITE_URL}${marketPath(market.code, item.code)}`]));
  return {
    ...buildMetadata({
      title: `${copy.title(market.name)} — NivaroBet`,
      description: copy.description(market.name),
      path: marketPath(market.code, lang),
      noIndex: !hasListings,
    }),
    alternates: {
      canonical: `${SITE_URL}${marketPath(market.code, lang)}`,
      languages: { ...languages, "x-default": `${SITE_URL}${marketPath(market.code, "en")}` },
    },
  };
}

export default async function MarketPage({ params }: Props) {
  const { country, lang } = await params;
  const market = getGeoMarket(country);
  if (!market || !isGeoLanguage(market, lang)) notFound();
  const copy = getMarketCopy(lang);
  const casinos = market.code === "ca" ? [] : await getCasinos({ countryCode: market.code, limit: 60 });
  const path = marketPath(market.code, lang);
  const pageTitle = copy.title(market.name);
  const pageDescription = copy.description(market.name);
  const schemas = [
    webPageJsonLd({ name: pageTitle, description: pageDescription, path }),
    breadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: "Markets", url: `${SITE_URL}/markets` }, { name: pageTitle, url: `${SITE_URL}${path}` }]),
    ...(casinos.length ? [itemListJsonLd(casinos.map(c => ({ name: c.name, url: `${SITE_URL}/casinos/${c.slug}` })))] : []),
  ];

  return <main className="container page market-page">
    {schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
    <div className="market-hero market-hero-premium">
      <span className="market-hero-flag">{market.flag}</span>
      <div>
        <span className="eyebrow">{copy.eyebrow} · {lang.toUpperCase()}</span>
        <h1>{copy.title(market.name)}</h1>
        <p>{copy.description(market.name)}</p>
        {market.currency ? <span className="market-currency">{market.currency}</span> : null}
      </div>
    </div>

    {market.languages.length > 1 ? <div className="market-language-tabs" aria-label="Languages">{market.languages.map((item) => <Link className={item.code === lang ? "active" : ""} key={item.code} href={marketPath(market.code, item.code)}>{item.label}</Link>)}</div> : null}
    {market.regions?.length ? <div className="market-region-links"><span>{copy.regionsLabel}</span>{market.regions.map((region) => <Link key={region.code} href={`/markets/${market.code}/${lang}/${region.code}`}>{region.name}</Link>)}</div> : null}

    {casinos.length ? <section aria-label={copy.verifiedLabel}><div className="nivaro-casino-grid">{casinos.map((casino, index) => <CasinoCard key={casino.id} casino={casino} accent={accentFromIndex(index)} />)}</div></section> : <div className="market-empty compact-empty"><h2>{copy.emptyTitle}</h2><p>{copy.emptyText}</p></div>}
  </main>;
}
