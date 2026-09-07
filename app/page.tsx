import {LatestPartnerUpdates} from "@/components/LatestPartnerUpdates";
import Link from "next/link";
import {ArrowUpRight,BarChart3,ChevronRight,CircleDollarSign,Fingerprint,Globe2,LockKeyhole,Route,ShieldCheck,Sparkles,WalletCards,ChartNoAxesCombined,Bitcoin,Bell,Bookmark,Compass,Gamepad2,AppWindow} from "lucide-react";
import {SITE_NAME} from "@/lib/site";
import {buildMetadata,webPageJsonLd,faqJsonLd} from "@/lib/seo";
import {FeaturedPartners} from "@/components/FeaturedPartners";
import {TrustStrip} from "@/components/TrustStrip";
import {ResearchPulse} from "@/components/ResearchPulse";
import {CategoryArchitecture} from "@/components/CategoryArchitecture";
import {HeroStage} from "@/components/HeroStage";
import {MethodologyTrack} from "@/components/MethodologyTrack";
import {HomeSearch} from "@/components/HomeSearch";
import {EcosystemGraph} from "@/components/EcosystemGraph";
import {MarketGlobe} from "@/components/MarketGlobe";
import {OpportunityTaxonomy} from "@/components/OpportunityTaxonomy";
import {CompareLike} from "@/components/CompareLike";

export const metadata=buildMetadata({
  title:`${SITE_NAME} — Compare crypto exchanges, wallets and brokers`,
  description:"Discover, compare and research crypto exchanges, wallets, brokers and tools. Save what matters, follow companies, and keep affiliate links closed until a market is approved.",
  path:"/",
  keywords:["crypto exchange comparison","wallet comparison","broker research","DEX research"],
});

const lanes=[
  {n:"01",icon:<Bitcoin/>,title:"Exchanges",copy:"Spot, derivatives and funding — researched as custody-plus-market-access products.",href:"/exchanges",meta:"EXCHANGES"},
  {n:"02",icon:<ChartNoAxesCombined/>,title:"Brokers",copy:"Forex, CFDs and multi-asset brokers stay in their own lane because the legal entity is different.",href:"/brokers",meta:"BROKERS"},
  {n:"03",icon:<WalletCards/>,title:"Wallets",copy:"Hardware, software and browser wallets compared by who holds the keys and how recovery works.",href:"/wallets",meta:"WALLETS"},
];

export default function Home(){
  const schema=webPageJsonLd({name:`${SITE_NAME} crypto research`,description:"Independent comparison research for crypto and trading platforms.",path:"/"});
  const faq=faqJsonLd([
    {question:"Does TopPick give investment advice?",answer:"No. TopPick publishes general research and comparison information, not personal investment, legal or tax advice."},
    {question:"Why are some directories empty?",answer:"A profile appears only after it is reviewed and published. Empty directories are intentional, not unfinished placeholders filled with sample brands."},
    {question:"When does a partner button appear?",answer:"Only after a stored partner URL exists and a market rule allows promotion. Unknown markets stay closed."},
  ]);
  return <main className="ag-home">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faq)}}/>
    <HeroStage>
      <div className="ag-kicker"><span className="pulse"/> DISCOVER · COMPARE · RESEARCH</div>
      <h1>
        <span className="tp-brand-line">Read the market</span>
        <span className="tp-brand-line">before the market</span>
        <span className="tp-brand-line accent">reads you.</span>
      </h1>
      <p>TopPick helps you discover exchanges, brokers, wallets, DEXs, DeFi and trading tools — then compare like with like, with source-linked facts and country-aware availability.</p>
      <div className="ag-hero-cta">
        <Link href="/finder">Start the finder <ArrowUpRight/></Link>
        <Link href="/compare">Compare products</Link>
      </div>
      <HomeSearch/>
      <div className="ag-risk-line"><ShieldCheck/> Trading and digital assets can involve substantial loss. Availability and protections vary by country.</div>
    </HeroStage>
    <TrustStrip/>
    <EcosystemGraph/>
    <section className="ag-lanes"><div className="ag-section-marker">START WITH A PRODUCT CLASS</div>{lanes.map(l=><Link href={l.href} className="ag-lane" key={l.n}><div className="lane-num">{l.n}</div><div className="lane-icon">{l.icon}</div><div className="lane-copy"><small>{l.meta}</small><h2>{l.title}</h2><p>{l.copy}</p></div><ChevronRight className="lane-arrow"/></Link>)}</section>
    <CategoryArchitecture/>
    <CompareLike/>
    <MarketGlobe/>
    <OpportunityTaxonomy/>
    <section className="tp-home-rail" id="use-toppick">
      <Link href="/learn" className="tp-rail-card"><Fingerprint/><span>RESEARCH</span><h3>Guides you can use today</h3></Link>
      <Link href="/finder" className="tp-rail-card"><Compass/><span>FINDER</span><h3>Start from the job you need done</h3></Link>
      <Link href="/account" className="tp-rail-card"><Bookmark/><span>ACCOUNT</span><h3>Save, follow, get notified</h3></Link>
      <Link href="/apps" className="tp-rail-card"><AppWindow/><span>APP</span><h3>Install TopPick</h3></Link>
    </section>
    <FeaturedPartners/>
    <LatestPartnerUpdates/>
    <MethodologyTrack/>
    <ResearchPulse/>
    <section className="tp-home-rail">
      <Link href="/account" className="tp-rail-card"><Bell/><span>WATCHLIST</span><h3>Follow without the noise</h3></Link>
      <Link href="/games" className="tp-rail-card"><Gamepad2/><span>GAMES</span><h3>TopPick originals, later</h3></Link>
      <Link href="/how-we-rate" className="tp-rail-card"><BarChart3/><span>METHOD</span><h3>How a profile gets published</h3></Link>
      <Link href="/opportunities" className="tp-rail-card"><CircleDollarSign/><span>OFFERS</span><h3>Conditions attached, always</h3></Link>
    </section>
    <section className="ag-split"><div className="ag-split-copy"><div className="ag-section-marker">HOW TOPPICK WORKS</div><h2>Published only after review.</h2><p>A company can exist as a draft. You see it only when it is reviewed, visible, and allowed for your market. Partner links are a separate decision from the research profile.</p><Link href="/how-we-rate">How we research <ArrowUpRight/></Link></div><div className="ag-system-map"><div className="sys-row"><span>01</span><b><Fingerprint/> Identity</b><em>official site and operator, when sourced</em></div><div className="sys-row"><span>02</span><b><ShieldCheck/> Custody & risk</b><em>who holds assets, what is disclosed</em></div><div className="sys-row"><span>03</span><b><CircleDollarSign/> Cost</b><em>fees only when a source exists</em></div><div className="sys-row"><span>04</span><b><Globe2/> Market</b><em>available, restricted, unknown, or needs review</em></div><div className="sys-row"><span>05</span><b><Route/> Partner link</b><em>used only if a real affiliate URL is stored</em></div></div></section>
    <section className="ag-bottom-cta"><Sparkles/><div><span>FOR COMPANIES</span><h2>Advertise, run affiliate, or manage your official presence.</h2></div><Link href="/partners">Partner with TopPick <ArrowUpRight/></Link></section>
  </main>;
}
