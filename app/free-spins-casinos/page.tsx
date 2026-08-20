import { Gift, Sparkles, ShieldCheck, Search } from "lucide-react";
import { CasinoCard } from "@/components/CasinoCard";
import { EmptyState } from "@/components/GuideCard";
import { getCasinos } from "@/lib/data";
import { accentFromIndex } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Best Free Spins Casinos ${currentYear} | Casino Free Spins | Nivaro`,
  description:
    `Discover free spins casinos for ${currentYear}. Compare online casino free spins, bonus offers, welcome promotions and casino features on Nivaro.`,
  keywords: [
    "free spins casinos",
    "casino free spins",
    "best free spins casinos",
    "online casino free spins",
    "free spins casino bonus",
    "casino bonus free spins",
    "free spins bonus",
    "welcome bonus free spins",
    "no deposit free spins",
    "casino bonuses",
    "best casino bonuses",
    "online casinos",
  ],
  alternates: {
    canonical: "/free-spins-casinos",
  },
  openGraph: {
    title: `Best Free Spins Casinos ${currentYear} | Nivaro`,
    description:
      "Compare online casinos with free spins, welcome promotions and casino bonus offers on Nivaro.",
    type: "website",
  },
};

export default async function FreeSpinsCasinosPage() {
  const casinos = await getCasinos({
    freeSpins: true,
    limit: 50,
  });

  return (
    <main className="container page">
      <section className="page-title">
        <span className="eyebrow">
          <Sparkles size={15} /> FREE SPINS CASINO DISCOVERY
        </span>

        <h1>Best Free Spins Casinos {currentYear}</h1>

        <p>
          Discover and compare online casinos with free spins offers. Explore
          available promotions, welcome bonuses and casino features in one
          place.
        </p>
      </section>

      <section className="trust-strip">
        <div>
          <Sparkles />
          <strong>Free Spins Offers</strong>
          <span>Discover casinos offering free spins promotions.</span>
        </div>

        <div>
          <Gift />
          <strong>Casino Bonuses</strong>
          <span>Compare free spins with other available bonus offers.</span>
        </div>

        <div>
          <ShieldCheck />
          <strong>Clear Information</strong>
          <span>Review important casino and promotion details.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <Search size={15} /> EXPLORE FREE SPINS
            </span>
            <h2>Compare Free Spins Casinos</h2>
          </div>
        </div>

        {casinos.length ? (
          <div className="grid-3">
            {casinos.map((casino, index) => (
              <CasinoCard
                key={casino.id}
                casino={casino}
                accent={accentFromIndex(index)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Free spins casinos coming soon"
            message="Nivaro is currently adding casino free spins offers. Check back soon for new listings."
          />
        )}
      </section>

      <section className="section">
        <div className="page-title">
          <span className="eyebrow">FREE SPINS GUIDE</span>

          <h2>What Are Casino Free Spins?</h2>

          <p>
            Free spins are casino promotions that may provide eligible players
            with a number of spins on selected slot games. They can be offered
            as part of a welcome bonus, deposit promotion or another casino
            campaign.
          </p>

          <h2>How to Compare Free Spins Offers</h2>

          <p>
            When comparing free spins offers, check the number of spins,
            eligible games, wagering requirements, expiration period and any
            withdrawal limits. Promotion terms can change, so always review the
            casino&apos;s current terms and conditions before claiming an offer.
          </p>
        </div>
      </section>
    </main>
  );
}