import { Gift, Sparkles, ShieldCheck, Search } from "lucide-react";
import { BonusCard } from "@/components/BonusCard";
import { EmptyState } from "@/components/GuideCard";
import { getBonuses } from "@/lib/data";

const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Best Casino Bonuses ${currentYear} | Welcome Offers & Free Spins | Nivaro`,
  description:
    `Discover the best casino bonuses for ${currentYear}. Compare welcome offers, free spins, no deposit bonuses and other online casino promotions on Nivaro.`,
  keywords: [
    "best casino bonuses",
    "casino bonuses",
    "online casino bonuses",
    "casino welcome bonus",
    "welcome bonus casinos",
    "free spins bonuses",
    "no deposit bonuses",
    "casino bonus codes",
    "best casino offers",
    "online casino promotions",
    "casino free spins",
    "new casino bonuses",
    "casino deposit bonus",
    "best online casino bonuses",
  ],
  alternates: {
    canonical: "/best-casino-bonuses",
  },
  openGraph: {
    title: `Best Casino Bonuses ${currentYear} | Nivaro`,
    description:
      "Compare welcome bonuses, free spins, no deposit offers and other online casino promotions on Nivaro.",
    type: "website",
  },
};

export default async function BestCasinoBonusesPage() {
  const bonuses = await getBonuses({ limit: 50 });

  return (
    <main className="container page">
      <section className="page-title">
        <span className="eyebrow">
          <Gift size={15} /> CASINO BONUS DISCOVERY
        </span>

        <h1>Best Casino Bonuses {currentYear}</h1>

        <p>
          Discover and compare online casino bonuses in one place. Explore
          welcome offers, free spins, no deposit promotions and other casino
          bonus opportunities available through listed operators.
        </p>
      </section>

      <section className="trust-strip">
        <div>
          <Gift />
          <strong>Bonus Discovery</strong>
          <span>Explore available casino promotions and welcome offers.</span>
        </div>

        <div>
          <Sparkles />
          <strong>Free Spins</strong>
          <span>Compare casino bonuses that may include free spins.</span>
        </div>

        <div>
          <ShieldCheck />
          <strong>Clear Information</strong>
          <span>Review bonus details and important conditions.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <Search size={15} /> EXPLORE CASINO BONUSES
            </span>
            <h2>Compare Casino Bonus Offers</h2>
          </div>
        </div>

        {bonuses.length ? (
          <div className="grid-3">
            {bonuses.map((bonus) => (
              <BonusCard key={bonus.id} bonus={bonus} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Casino bonuses coming soon"
            message="Nivaro is currently adding and reviewing casino bonus offers. Check back soon for new promotions."
          />
        )}
      </section>

      <section className="section">
        <div className="page-title">
          <span className="eyebrow">CASINO BONUS GUIDE</span>

          <h2>What Is an Online Casino Bonus?</h2>

          <p>
            An online casino bonus is a promotional offer provided by a casino.
            Depending on the promotion, it may include bonus funds, free spins,
            deposit matches or other rewards. Eligibility and conditions vary
            between operators.
          </p>

          <h2>Common Types of Casino Bonuses</h2>

          <p>
            Common casino promotions include welcome bonuses, deposit bonuses,
            free spins and no deposit offers. Each promotion can have different
            wagering requirements, eligible games, expiration periods and
            withdrawal conditions.
          </p>

          <h2>How to Compare Casino Bonuses</h2>

          <p>
            Look beyond the advertised bonus amount. Compare wagering
            requirements, minimum deposit rules, eligible games, maximum
            withdrawal limits, expiration dates and other conditions before
            choosing an offer.
          </p>

          <h2>Why Bonus Terms Matter</h2>

          <p>
            Casino promotions can change over time, and the headline offer does
            not always show every condition. Always review the operator&apos;s
            current bonus terms before claiming a promotion.
          </p>
        </div>
      </section>
    </main>
  );
}