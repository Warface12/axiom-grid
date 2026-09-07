import {LatestPartnerUpdates} from "@/components/LatestPartnerUpdates";
import Link from "next/link";
import {ArrowUpRight,BarChart3,ChevronRight,CircleDollarSign,Fingerprint,Globe2,LockKeyhole,Radar,Route,ShieldCheck,Sparkles,WalletCards,ChartNoAxesCombined,Bitcoin,Search,Bell,Bookmark,Compass,Gamepad2,AppWindow} from "lucide-react";
import {SITE_NAME} from "@/lib/site";
import {buildMetadata,webPageJsonLd,faqJsonLd} from "@/lib/seo";
import {FeaturedPartners} from "@/components/FeaturedPartners";
import {TrustStrip} from "@/components/TrustStrip";
import {ResearchPulse} from "@/components/ResearchPulse";
import {CategoryArchitecture} from "@/components/CategoryArchitecture";
import {HeroStage} from "@/components/HeroStage";
import {MethodologyTrack} from "@/components/MethodologyTrack";
import {HomeSearch} from "@/components/HomeSearch";

export const metadata=buildMetadata({
  title:`${SITE_NAME} — Compare crypto exchanges, wallets and brokers`,
  description:"Discover, compare and research crypto exchanges, wallets, brokers and tools. Save what matters, follow companies, and keep affiliate links closed until a market is approved.",
  path:"/",
  keywords:["crypto exchange comparison","wallet comparison","broker research","DEX research"],
});

const lanes=[
  {n:"01",icon:<Bitcoin/>,title:"Exchanges",copy:"Spot, derivatives and funding — researched as custody-plus-market-access products, not generic trading apps.",href:"/exchanges",meta:"CEX"},
  {n:"02",icon:<ChartNoAxesCombined/>,title:"Brokers",copy:"Forex, CFDs and multi-asset brokers stay in their own lane because the legal entity and instruments are different.",href:"/brokers",meta:"BROKERS"},
  {n:"03",icon:<WalletCards/>,title:"Wallets",copy:"Hardware, software and browser wallets compared by who holds the keys, how recovery works, and which chains are stated.",href:"/wallets",meta:"CUSTODY"},
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
      <h1>Find the right crypto product.<br/><span>Keep the facts honest.</span></h1>
      <p>TopPick helps you discover exchanges, wallets, brokers and tools, compare like with like, and understand custody, fees and market limits — without invented ratings or sample companies.</p>
      <div className="ag-hero-cta">
        <Link href="/finder">Start the finder <ArrowUpRight/></Link>
        <Link href="/compare">Compare products</Link>
      </div>
      <HomeSearch/>
      <div className="ag-risk-line"><ShieldCheck/> Trading and digital assets can involve substantial loss. Availability and protections vary by country.</div>
    </HeroStage>
    <TrustStrip/><FeaturedPartners/><LatestPartnerUpdates/>
    <section className="ag-market-visual" aria-label="Product map"><div className="ag-hero-right"><div className="ag-crypto-orbit orbit-a"><b>EX</b><span>CEX</span></div><div className="ag-crypto-orbit orbit-b"><b>WL</b><span>KEYS</span></div><div className="ag-crypto-orbit orbit-c"><b>DX</b><span>DEX</span></div><div className="ag-chain-stream"><i/><i/><i/><i/><i/><i/></div><div className="ag-radar"><span className="ring r1"/><span className="ring r2"/><span className="ring r3"/><span className="axis x"/><span className="axis y"/><span className="scan"/><i className="dot d1"/><i className="dot d2"/><i className="dot d3"/><div className="radar-center"><Radar/><b>TOPPICK</b><small>PRODUCT MAP</small></div></div><div className="ag-float-note n1"><LockKeyhole/> custody</div><div className="ag-float-note n2"><Globe2/> markets</div><div className="ag-float-note n3"><Compass/> compare</div></div></section>
    <section className="ag-ticker"><div>DISCOVER <b>CATEGORIES</b></div><div>COMPARE <b>LIKE WITH LIKE</b></div><div>RESEARCH <b>GUIDES</b></div><div>FOLLOW <b>UPDATES</b></div><div>MARKETS <b>GEO</b></div></section>
    <section className="ag-lanes"><div className="ag-section-marker">EXPLORE BY CATEGORY</div>{lanes.map(l=><Link href={l.href} className="ag-lane" key={l.n}><div className="lane-num">{l.n}</div><div className="lane-icon">{l.icon}</div><div className="lane-copy"><small>{l.meta}</small><h2>{l.title}</h2><p>{l.copy}</p></div><ChevronRight className="lane-arrow"/></Link>)}</section>
    <CategoryArchitecture/>
    <section className="tp-proof-grid" id="use-toppick">
      <Link href="/compare" className="tp-home-card"><BarChart3/><span>COMPARE</span><h3>Side-by-side, same product class</h3><p>Exchanges with exchanges, wallets with wallets. Missing fields stay unpublished.</p></Link>
      <Link href="/learn" className="tp-home-card"><Fingerprint/><span>RESEARCH</span><h3>Guides you can use today</h3><p>Custody, fees, brokers vs exchanges, and how we review a platform.</p></Link>
      <Link href="/opportunities" className="tp-home-card"><CircleDollarSign/><span>OPPORTUNITIES</span><h3>Offers with conditions attached</h3><p>Cash, crypto, credit or points — never treated as the same thing.</p></Link>
      <Link href="/finder" className="tp-home-card"><Compass/><span>TOOLS</span><h3>Guided product finder</h3><p>Start from the job: trading, holding keys, DeFi, cards or analytics.</p></Link>
      <Link href="/account" className="tp-home-card"><Bookmark/><span>YOUR ACCOUNT</span><h3>Save, follow and get notified</h3><p>Keep products, watchlists, comparisons, opportunities and email preferences in one TopPick account.</p></Link>
      <Link href="/markets" className="tp-home-card"><Globe2/><span>MARKETS</span><h3>Country-aware discovery</h3><p>Product access and promotional eligibility are separate questions.</p></Link>
    </section>
    <MethodologyTrack/>
    <ResearchPulse/>
    <section className="tp-proof-grid">
      <Link href="/account" className="tp-home-card"><Bell/><span>WATCHLIST</span><h3>Follow without the noise</h3><p>In-product notices and optional email. Promotions never go to every account by default.</p></Link>
      <Link href="/apps" className="tp-home-card"><AppWindow/><span>APP</span><h3>Install TopPick</h3><p>Add the PWA to your home screen. Native store builds are listed only when they exist.</p></Link>
      <Link href="/games" className="tp-home-card"><Gamepad2/><span>GAMES</span><h3>TopPick games, later</h3><p>Original games stay isolated from this research site. Third-party crypto games have their own index.</p></Link>
    </section>
    <section className="ag-split"><div className="ag-split-copy"><div className="ag-section-marker">HOW TOPPICK WORKS</div><h2>Published only after review.</h2><p>A company can exist as a draft. You see it only when it is reviewed, visible, and allowed for your market. Partner links are a separate decision from the research profile.</p><Link href="/how-we-rate">How we research <ArrowUpRight/></Link></div><div className="ag-system-map"><div className="sys-row"><span>01</span><b><Fingerprint/> Identity</b><em>official site and operator, when sourced</em></div><div className="sys-row"><span>02</span><b><ShieldCheck/> Custody & risk</b><em>who holds assets, what is disclosed</em></div><div className="sys-row"><span>03</span><b><CircleDollarSign/> Cost</b><em>fees only when a source exists</em></div><div className="sys-row"><span>04</span><b><Globe2/> Market</b><em>available, restricted, unknown, or needs review</em></div><div className="sys-row"><span>05</span><b><Route/> Partner link</b><em>used only if a real affiliate URL is stored</em></div></div></section>
    <section className="ag-bottom-cta"><Sparkles/><div><span>FOR COMPANIES</span><h2>Advertise, run affiliate, or manage your official presence.</h2></div><Link href="/partners">Partner with TopPick <ArrowUpRight/></Link></section>
    <section className="ag-bottom-cta"><Search/><div><span>KEEP GOING</span><h2>Read the method before you expect a ranking.</h2></div><Link href="/how-we-rate">How we rate <ArrowUpRight/></Link></section>
  </main>;
}
