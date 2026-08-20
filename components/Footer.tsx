import Link from "next/link";
import { GEO_MARKETS, marketPath } from "@/lib/geo";
import { getCasinos } from "@/lib/data";

export async function Footer() {
  const casinos = await getCasinos({ limit: 1000 });
  const countryCodes = new Set(casinos.flatMap((casino) => casino.country_codes || []).map((code) => code.toLowerCase()));
    const featured = GEO_MARKETS.filter((market) => market.featured && countryCodes.has(market.code)).slice(0, 10);

  return <footer className="site-footer">
    <div className="container footer-grid footer-grid-expanded">
      <div className="footer-brand">
        <Link href="/" className="logo nivarobet-logo footer-logo"><span className="nivaro-metal-mark"><span className="nivaro-metal-n">N</span><span className="nivaro-red-slash"/><span className="nivaro-metal-shine"/></span><span className="logo-copy nivarobet-logo-copy"><strong><span className="brand-nivaro">NIVARO</span><span className="brand-bet">BET</span></strong><span>CASINO DISCOVERY</span></span></Link>
        <p>Independent casino discovery and monitored partner information. NivaroBet is an affiliate comparison publisher, not a casino or gambling operator. Unsupported or unapproved claims stay unpublished.</p>
      </div>
      <div><h4>Discover</h4><Link href="/about">About NivaroBet</Link><Link href="/casinos">Casinos</Link><Link href="/guides">Guides</Link><Link href="/compare">Compare</Link><Link href="/finder">Smart Match</Link>{featured.length ? <Link href="/markets">Countries & languages</Link> : null}</div>
      <div><h4>Trust</h4><Link href="/how-we-review">How we review</Link><Link href="/how-we-verify">How we verify</Link><Link href="/editorial-policy">Editorial policy</Link><Link href="/corrections">Corrections policy</Link><Link href="/legal/affiliate-disclosure">Affiliate disclosure</Link></div>
      <div><h4>Legal</h4><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/responsible-gambling">Responsible gambling</Link><Link href="/legal/cookies">Cookies</Link><Link href="/contact">Contact</Link></div>
    </div>
    {featured.length ? <div className="container footer-markets"><span>Popular locations</span><div>{featured.map((market) => <Link key={market.code} href={marketPath(market.code)}>{market.flag} {market.name}</Link>)}<Link href="/markets">View all countries →</Link></div></div> : null}
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} NivaroBet. Affiliate comparison publisher — not a casino or gambling operator. 18+/legal age only. Availability and rules vary by location. Gamble responsibly.</span></div>
  </footer>;
}
