import {LatestPartnerUpdates} from "@/components/LatestPartnerUpdates";
import Link from "next/link";
import {ArrowUpRight,BarChart3,Bot,ChartNoAxesCombined,ChevronRight,CircleDollarSign,Cpu,Fingerprint,Globe2,LockKeyhole,Radar,Route,ShieldCheck,Sparkles,WalletCards,Waves,DatabaseZap,ScanSearch,Bitcoin} from "lucide-react";
import {SITE_NAME} from "@/lib/site";
import {buildMetadata,webPageJsonLd,faqJsonLd} from "@/lib/seo";
import {FeaturedPartners} from "@/components/FeaturedPartners";
import {TrustStrip} from "@/components/TrustStrip";
import {ResearchPulse} from "@/components/ResearchPulse";
import {CategoryArchitecture} from "@/components/CategoryArchitecture";
import {HeroStage} from "@/components/HeroStage";
import {MethodologyTrack} from "@/components/MethodologyTrack";

export const metadata=buildMetadata({
  title:`${SITE_NAME} — Compare crypto exchanges, wallets and brokers`,
  description:"Independent research for crypto exchanges, wallets, brokers and trading tools. We compare what is published, leave gaps empty, and keep partner links closed until a market is approved.",
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
    {question:"Why are there no exchange cards yet?",answer:"Partners are added only when the owner publishes a reviewed record. Empty directories are intentional."},
    {question:"When does an affiliate button appear?",answer:"Only after a stored partner URL exists and a market rule allows promotion. Unknown markets stay closed."},
  ]);
  return <main className="ag-home">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faq)}}/>
    <HeroStage>
      <div className="ag-kicker"><span className="pulse"/> CRYPTO RESEARCH / COMPARISON</div>
      <h1>Compare platforms.<br/><span>Keep the facts honest.</span></h1>
      <p>TopPick helps you research exchanges, wallets, brokers and related crypto tools. We separate product facts, editorial notes, country eligibility and affiliate links — and we do not invent missing numbers.</p>
      <div className="ag-hero-cta">
        <Link href="/compare">Compare platforms <ArrowUpRight/></Link>
        <Link href="/how-we-rate">How we research</Link>
      </div>
      <div className="ag-risk-line"><ShieldCheck/> Trading and digital assets can involve substantial loss. Availability and protections vary by country.</div>
    </HeroStage>
    <TrustStrip/><FeaturedPartners/><LatestPartnerUpdates/>
    <section className="ag-market-visual"><div className="ag-hero-right"><div className="ag-crypto-orbit orbit-a"><b>EX</b><span>CEX</span></div><div className="ag-crypto-orbit orbit-b"><b>WL</b><span>KEYS</span></div><div className="ag-crypto-orbit orbit-c"><b>DX</b><span>DEX</span></div><div className="ag-chain-stream"><i/><i/><i/><i/><i/><i/></div><div className="ag-radar"><span className="ring r1"/><span className="ring r2"/><span className="ring r3"/><span className="axis x"/><span className="axis y"/><span className="scan"/><i className="dot d1"/><i className="dot d2"/><i className="dot d3"/><div className="radar-center"><Radar/><b>TOPPICK</b><small>RESEARCH MAP</small></div></div><div className="ag-float-note n1"><LockKeyhole/> custody</div><div className="ag-float-note n2"><Globe2/> markets</div><div className="ag-float-note n3"><Waves/> sources</div></div></section>
    <section className="ag-ticker"><div>VENUES <b>EXCHANGES</b></div><div>EXECUTION <b>BROKERS</b></div><div>KEYS <b>WALLETS</b></div><div>ON-CHAIN <b>DEX / DEFI</b></div><div>ACCESS <b>MARKETS</b></div></section>
    <section className="ag-lanes"><div className="ag-section-marker">START HERE</div>{lanes.map(l=><Link href={l.href} className="ag-lane" key={l.n}><div className="lane-num">{l.n}</div><div className="lane-icon">{l.icon}</div><div className="lane-copy"><small>{l.meta}</small><h2>{l.title}</h2><p>{l.copy}</p></div><ChevronRight className="lane-arrow"/></Link>)}</section>
    <CategoryArchitecture/>
    <MethodologyTrack/>
    <ResearchPulse/>
    <section className="ag-split"><div className="ag-split-copy"><div className="ag-section-marker">HOW RECORDS WORK</div><h2>Published only after review.</h2><p>A platform can sit in Admin as a draft. Public pages show it only when it is reviewed, visible, and allowed for the visitor’s market. Affiliate buttons are a separate switch.</p><Link href="/editorial-policy">Editorial policy <ArrowUpRight/></Link></div><div className="ag-system-map"><div className="sys-row"><span>01</span><b><Fingerprint/> Identity</b><em>official site and operator, when sourced</em></div><div className="sys-row"><span>02</span><b><ShieldCheck/> Custody & risk</b><em>who holds assets, what is disclosed</em></div><div className="sys-row"><span>03</span><b><CircleDollarSign/> Cost</b><em>fees only when a source exists</em></div><div className="sys-row"><span>04</span><b><Globe2/> Market</b><em>available, restricted, unknown, or needs review</em></div><div className="sys-row"><span>05</span><b><Route/> Partner link</b><em>used only if a real affiliate URL is stored</em></div></div></section>
    <section className="tp-proof-grid"><article><DatabaseZap/><span>INVENTORY</span><h3>Ready for real partners</h3><p>When you add a platform, the same templates, GEO rules and comparison engine apply — without rebuilding the site.</p></article><article><ScanSearch/><span>SEARCH</span><h3>Find research, not filler</h3><p>Search lists published profiles and guides. With an empty inventory it simply says nothing matched.</p></article><article><ShieldCheck/><span>AFFILIATE SAFETY</span><h3>Closed until approved</h3><p>Promotional routing checks a market record first. Missing or expired eligibility keeps the button off.</p></article></section>
    <section className="ag-console"><div className="console-head"><span>TOPPICK CONTROL PLANE</span><span>NO SAMPLE COMPANIES</span></div><div className="console-grid"><div className="console-main"><div className="terminal-line"><span>→</span> Public cards come from Admin, never from placeholder brands.</div><div className="terminal-line"><span>→</span> URL import collects public metadata into a draft. It does not publish.</div><div className="terminal-line"><span>→</span> Stale market approvals can be sent back to review.</div><div className="terminal-line accent"><span>→</span> Empty fields stay empty. Guessed fees and licenses are not allowed.</div></div><div className="console-side"><div><Bot/><span>DRAFTS</span><b>ADMIN</b></div><div><Cpu/><span>GEO GATES</span><b>FAIL-CLOSED</b></div><div><BarChart3/><span>SEO</span><b>READY</b></div></div></div></section>
    <section className="ag-bottom-cta"><Sparkles/><div><span>START WITH THE METHOD</span><h2>Read how we review a platform before you expect a ranking.</h2></div><Link href="/how-we-rate">How we rate <ArrowUpRight/></Link></section>
  </main>;
}
