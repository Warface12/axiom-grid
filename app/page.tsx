import {LatestPartnerUpdates} from "@/components/LatestPartnerUpdates";
import Link from "next/link";
import {ArrowUpRight,ShieldCheck,Sparkles} from "lucide-react";
import {SITE_NAME} from "@/lib/site";
import {buildMetadata,webPageJsonLd,faqJsonLd} from "@/lib/seo";
import {TrustStrip} from "@/components/TrustStrip";
import {HeroStage} from "@/components/HeroStage";
import {HomeSearch} from "@/components/HomeSearch";
import {DiscoverRail} from "@/components/DiscoverRail";
import {MarketGlobe} from "@/components/MarketGlobe";
import {OpportunityConstellation} from "@/components/OpportunityConstellation";
import {CompareLike} from "@/components/CompareLike";

export const metadata=buildMetadata({
  title:`${SITE_NAME} — Compare crypto exchanges, wallets and brokers`,
  description:"Discover, compare and research crypto exchanges, wallets, brokers and tools. Understand custody, markets and opportunities before you act.",
  path:"/",
  keywords:["crypto exchange comparison","wallet comparison","broker research","DEX research"],
});

export default function Home(){
  const schema=webPageJsonLd({name:`${SITE_NAME} crypto research`,description:"Independent comparison research for crypto and trading platforms.",path:"/"});
  const faq=faqJsonLd([
    {question:"Does TopPick give investment advice?",answer:"No. TopPick publishes general research and comparison information, not personal investment, legal or tax advice."},
    {question:"How should I start?",answer:"Use the finder if you know the job, compare if you already have two products in the same class, or open a category such as exchanges, wallets or brokers."},
    {question:"Why does availability change by country?",answer:"Product access and promotions depend on the market you are in. TopPick treats that as part of the product, not a footnote."},
  ]);
  return <main className="ag-home">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faq)}}/>
    <HeroStage>
      <p className="ag-kicker"><span className="pulse"/> DISCOVER · COMPARE · RESEARCH</p>
      <h1>
        <span className="tp-brand-line">Read the market</span>
        <span className="tp-brand-line">before the market</span>
        <span className="tp-brand-line accent">reads you.</span>
      </h1>
      <p>Discover exchanges, brokers, wallets, DEXs and tools. Compare like with like. Check your market. Learn the risks before you act.</p>
      <div className="ag-hero-cta">
        <Link href="/finder">Find a product <ArrowUpRight/></Link>
        <Link href="/compare">Compare</Link>
      </div>
      <HomeSearch/>
      <TrustStrip/>
      <p className="ag-risk-line"><ShieldCheck/> Digital assets can involve substantial loss. Protections vary by country.</p>
    </HeroStage>
    <DiscoverRail/>
    <section className="tp-journey">
      <div className="tp-section-head">
        <p>GET STARTED</p>
        <h2>Four ways in</h2>
      </div>
      <div className="tp-journey-list">
        <Link href="/finder"><b>Finder</b><span>Start from the job you need done</span></Link>
        <Link href="/compare"><b>Compare</b><span>Exchange vs exchange, wallet vs wallet</span></Link>
        <Link href="/learn"><b>Learn</b><span>Custody, fees, brokers and risk</span></Link>
        <Link href="/search"><b>Search</b><span>Guides, terms and published profiles</span></Link>
      </div>
    </section>
    <CompareLike/>
    <MarketGlobe/>
    <OpportunityConstellation/>
    <section className="tp-save-story">
      <div className="tp-save-copy">
        <p>YOUR SET</p>
        <h2>Save, follow, get notified.</h2>
        <p>Keep the products you are researching. Follow a company. Hear about the classes you care about — across devices.</p>
        <Link className="tp-save-cta" href="/account">Open your TopPick</Link>
        <nav className="tp-save-links">
          <Link href="/apps">Install the app</Link>
          <Link href="/how-we-rate">How we research</Link>
          <Link href="/legal/risk-disclosure">Risks</Link>
        </nav>
      </div>
      <div className="tp-save-scene" aria-hidden="true">
        <span className="tp-save-plate" style={{["--d" as string]:"0"}}>Save</span>
        <span className="tp-save-plate" style={{["--d" as string]:"1"}}>Follow</span>
        <span className="tp-save-plate" style={{["--d" as string]:"2"}}>Notify</span>
      </div>
    </section>
    <LatestPartnerUpdates/>
    <section className="ag-bottom-cta"><Sparkles/><div><span>FOR COMPANIES</span><h2>Advertise or manage your official presence.</h2></div><Link href="/partners">Partner with TopPick <ArrowUpRight/></Link></section>
  </main>;
}
