import { LatestPartnerUpdates } from "@/components/LatestPartnerUpdates";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { SITE_NAME } from "@/lib/site";
import { buildMetadata, webPageJsonLd, faqJsonLd } from "@/lib/seo";
import { TrustStrip } from "@/components/TrustStrip";
import { HeroStage } from "@/components/HeroStage";
import { HomeSearch } from "@/components/HomeSearch";
import { DiscoverRail } from "@/components/DiscoverRail";
import { MarketGlobe } from "@/components/MarketGlobe";
import { OpportunityConstellation } from "@/components/OpportunityConstellation";
import { CompareLike } from "@/components/CompareLike";
import { ProductUniverse } from "@/components/visual/ProductUniverse";
import { SecurityVault } from "@/components/visual/SecurityVault";
import { ResearchEngine } from "@/components/visual/ResearchEngine";
import { PartnerNetwork } from "@/components/visual/PartnerNetwork";
import { LearnAtlas } from "@/components/visual/LearnAtlas";
import { MethodologyTrack } from "@/components/MethodologyTrack";
import { RESEARCH_JOBS } from "@/lib/jobs";
import { CATALOG } from "@/lib/catalog";

export const metadata = buildMetadata({
  title: `${SITE_NAME} — Compare crypto exchanges, wallets and brokers`,
  description: "Discover, compare and research crypto exchanges, wallets, brokers and tools. Understand custody, markets and opportunities before you act.",
  path: "/",
  keywords: ["crypto exchange comparison", "wallet comparison", "broker research", "DEX research", "crypto niches", "futures comparison", "bridge research", "lending", "restaking", "prediction markets"],
});

export default function Home() {
  const schema = webPageJsonLd({ name: `${SITE_NAME} crypto research`, description: "Independent comparison research for crypto and trading platforms.", path: "/" });
  const faq = faqJsonLd([
    { question: "Does TopPick give investment advice?", answer: "No. TopPick publishes general research and comparison information, not personal investment, legal or tax advice." },
    { question: "How should I start?", answer: "Use the finder if you know the job, compare if you already have two products in the same class, or open a category such as exchanges, wallets or brokers." },
    { question: "Why does availability change by country?", answer: "Product access and promotions depend on the market you are in. TopPick treats that as part of the product, not a footnote." },
  ]);
  return (
    <main className="ag-home tp-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <HeroStage>
        <p className="ag-kicker"><span className="pulse" /> Independent research studio</p>
        <h1>
          <span className="tp-brand-line">Read the product</span>
          <span className="tp-brand-line accent">before you fund it.</span>
        </h1>
        <p>Exchanges, wallets, brokers, futures, bridges and {CATALOG.length} researched niches — compared only on published facts. Empty classes stay empty.</p>
        <div className="ag-hero-cta">
          <Link href="/start">Start here <ArrowUpRight /></Link>
          <Link href="/niches">Browse niches</Link>
        </div>
        <HomeSearch />
        <TrustStrip />
        <p className="ag-risk-line"><ShieldCheck /> Digital assets can involve substantial loss. Protections vary by country.</p>
      </HeroStage>
      <ProductUniverse />
      <section className="tp-chapter tp-chapter--jobs" id="jobs">
        <div className="tp-chapter-inner">
          <header className="tp-chapter-copy">
            <p className="tp-kicker">Jobs</p>
            <h2>What are you actually trying to do?</h2>
            <p className="tp-lead">Buy on a venue. Hold keys. Trade perps. Move across chains. Report tax. Each job opens a class — not a ranked brand wall.</p>
          </header>
          <div className="tp-jobs-grid">
            {RESEARCH_JOBS.slice(0, 8).map((job) => (
              <Link key={job.href} className="tp-job-card" href={job.href}>
                <b>{job.title}</b>
                <p>{job.copy}</p>
              </Link>
            ))}
            <Link className="tp-job-card" href="/jobs">
              <b>See every job</b>
              <p>{RESEARCH_JOBS.length} working paths into the catalog.</p>
            </Link>
          </div>
        </div>
      </section>
      <section className="tp-chapter tp-chapter--finder" id="finder">
        <div className="tp-chapter-inner">
          <header className="tp-chapter-copy">
            <p className="tp-kicker">Finder</p>
            <h2>Start from the job, not the brand.</h2>
            <p className="tp-lead">Four questions. A product class. No invented ranking of companies.</p>
          </header>
          <Link className="tp-finder-launch" href="/finder">
            <span>01 Job</span>
            <span>02 Market</span>
            <span>03 Priority</span>
            <span>04 Custody</span>
            <b>Open the guided finder</b>
          </Link>
        </div>
      </section>
      <DiscoverRail />
      <CompareLike />
      <MarketGlobe />
      <OpportunityConstellation />
      <SecurityVault />
      <ResearchEngine />
      <LearnAtlas />
      <section className="tp-chapter tp-chapter--account">
        <div className="tp-chapter-inner tp-save-story">
          <div className="tp-save-copy">
            <p className="tp-kicker">User account / watchlist</p>
            <h2>Save, follow, get notified.</h2>
            <p>Keep the products you are researching. Follow a company. Hear about the classes you care about — across devices. Partner workspaces stay separate.</p>
            <Link className="tp-save-cta" href="/account">Open your TopPick</Link>
            <nav className="tp-save-links">
              <Link href="/apps">Install the app</Link>
              <Link href="/niches">Browse niches</Link>
              <Link href="/how-we-rate">How we research</Link>
              <Link href="/legal/risk-disclosure">Risks</Link>
            </nav>
          </div>
          <div className="tp-save-scene" aria-hidden="true">
            <span className="tp-save-plate" style={{ ["--d" as string]: "0" }}>Save</span>
            <span className="tp-save-plate" style={{ ["--d" as string]: "1" }}>Follow</span>
            <span className="tp-save-plate" style={{ ["--d" as string]: "2" }}>Notify</span>
          </div>
        </div>
      </section>
      <PartnerNetwork />
      <LatestPartnerUpdates />
      <section className="tp-chapter tp-chapter--trust">
        <div className="tp-chapter-inner">
          <MethodologyTrack />
        </div>
      </section>
      <section className="ag-bottom-cta">
        <div>
          <span>FOR COMPANIES</span>
          <h2>Advertise or manage your official presence.</h2>
        </div>
        <Link href="/partners">Partner with TopPick <ArrowUpRight /></Link>
      </section>
    </main>
  );
}
