import { notFound } from "next/navigation";
import Link from "next/link";
import { getGeoMarket, getMarketCopy, isGeoLanguage, marketPath } from "@/lib/geo";
import { getCasinos } from "@/lib/data";
import { CasinoCard } from "@/components/CasinoCard";
import { accentFromIndex, SITE_URL } from "@/lib/utils";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ country: string; lang: string; region: string }> };

export async function generateMetadata({ params }: Props) {
  const { country, lang, region } = await params;
  const market = getGeoMarket(country);
  const r = market?.regions?.find((x) => x.code === region);
  if (!market || !r || !isGeoLanguage(market, lang)) return buildMetadata({ title: "Region not found", noIndex: true });
  const copy = getMarketCopy(lang);
  const hasListings = (await getCasinos({ countryCode: market.code, regionCode: r.code, limit: 1 })).length > 0;
  const path = `/markets/${market.code}/${lang}/${r.code}`;
  const languages = Object.fromEntries(market.languages.map((item) => [item.code, `${SITE_URL}/markets/${market.code}/${item.code}/${r.code}`]));
  return {
    ...buildMetadata({ title: `${copy.regionTitle(r.name)} — NivaroBet`, description: copy.regionDescription(r.name, market.name), path, noIndex: !hasListings }),
    alternates: { canonical: `${SITE_URL}${path}`, languages: { ...languages, "x-default": `${SITE_URL}/markets/${market.code}/${market.defaultLanguage}/${r.code}` } },
  };
}

export default async function RegionPage({ params }: Props) {
  const { country, lang, region } = await params;
  const market = getGeoMarket(country);
  const r = market?.regions?.find((x) => x.code === region);
  if (!market || !r || !isGeoLanguage(market, lang)) notFound();
  const copy = getMarketCopy(lang);
  const casinos = await getCasinos({ countryCode: market.code, regionCode: r.code, limit: 60 });
  const path = `/markets/${market.code}/${lang}/${r.code}`;
  const title = copy.regionTitle(r.name);
  const description = copy.regionDescription(r.name, market.name);
  const schemas = [webPageJsonLd({ name: title, description, path }), breadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: "Markets", url: `${SITE_URL}/markets` }, { name: market.name, url: `${SITE_URL}${marketPath(market.code, lang)}` }, { name: r.name, url: `${SITE_URL}${path}` }]), ...(casinos.length ? [itemListJsonLd(casinos.map(c => ({ name: c.name, url: `${SITE_URL}/casinos/${c.slug}` })))] : [])];

  return <main className="container page market-page">
    {schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
    <Link className="text-link" href={marketPath(market.code, lang)}>← {market.flag} {market.name}</Link>
    <div className="market-hero market-hero-premium"><span className="market-hero-flag">{market.flag}</span><div><span className="eyebrow">{copy.regionEyebrow}</span><h1>{copy.regionTitle(r.name)}</h1><p>{copy.regionDescription(r.name, market.name)}</p></div></div>
    {casinos.length ? <div className="nivaro-casino-grid">{casinos.map((casino,index) => <CasinoCard key={casino.id} casino={casino} accent={accentFromIndex(index)} />)}</div> : null}
  </main>;
}
