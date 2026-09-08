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

export const metadata = buildMetadata({
  title: `${SITE_NAME} — Compare crypto exchanges, wallets and brokers`,
  description: "Discover, compare and research crypto exchanges, wallets, brokers and tools. Understand custody, markets and opportunities before you act.",
  path: "/",
  keywords: ["crypto exchange comparison", "wallet comparison", "broker research", "DEX research"],
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
        <p className="ag-kicker"><span className="pulse" /> Intelligence core</p>
        <h1>
          <span className="tp-brand-line">Read the market</span>
          <span className="tp-brand-line accent">before it reads you.</span>
        </h1>
        <p>Discover exchanges, brokers, wallets, DEXs and tools. Compare like with like. Check your market. Learn the risks before you act.</p>
        <div className="ag-hero-cta">
          <Link href="/finder">Find a product <ArrowUpRight /></Link>
          <Link href="/compare">Compare</Link>
        </div>
        <HomeSearch />
        <TrustStrip />
        <p className="ag-risk-line"><ShieldCheck /> Digital assets can involve substantial loss. Protections vary by country.</p>
      </HeroStage>
      <ProductUniverse />
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
