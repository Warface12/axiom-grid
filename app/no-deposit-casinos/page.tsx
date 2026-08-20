import { Gift, ShieldCheck, Search, Sparkles } from "lucide-react";
import { CasinoCard } from "@/components/CasinoCard";
import { EmptyState } from "@/components/GuideCard";
import { getCasinos } from "@/lib/data";
import { accentFromIndex } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Best No Deposit Casinos ${currentYear} | Casino Bonuses | Nivaro`,
  description:
    `Discover no deposit casinos and casino bonuses for ${currentYear}. Compare no deposit offers, free spins, casino sites and available promotions on Nivaro.`,
  keywords: [
    "no deposit casinos",
    "no deposit casino",
    "no deposit casino bonuses",
    "best no deposit casinos",
    "casino no deposit bonus",
    "no deposit bonus",
    "casino bonus no deposit",
    "free casino bonuses",
    "free spins no deposit",
    "no deposit free spins",
    "online casino bonuses",
    "best casino bonuses",
    "casino bonus codes",
    "free spins casinos",
    "online casinos",
  ],
  alternates: {
    canonical: "/no-deposit-casinos",
  },
  openGraph: {
    title: `Best No Deposit Casinos ${currentYear} | Nivaro`,
    description:
      "Compare no deposit casino offers, free spins and online casino bonuses on Nivaro.",
    type: "website",
  },
};

export default async function NoDepositCasinosPage() {
  const casinos = await getCasinos({
    noDeposit: true,
    limit: 50,
  });

  return (
    <main className="container page">
      <section className="page-title">
        <span className="eyebrow">
          <Gift size={15} /> NO DEPOSIT CASINO DISCOVERY
        </span>

        <h1>Best No Deposit Casinos {currentYear}</h1>

        <p>
          Explore online casinos with no deposit offers. Compare available
          bonuses, free spins, casino features and other important information
          to find offers that suit you.
        </p>
      </section>

      <section className="trust-strip">
        <div>
          <Gift />
          <strong>No Deposit Offers</strong>
          <span>Browse casinos with available no deposit promotions.</span>
        </div>

        <div>
          <Sparkles />
          <strong>Free Spins</strong>
          <span>Discover casino offers that may include free spins.</span>
        </div>

        <div>
          <ShieldCheck />
          <strong>Clear Comparisons</strong>
          <span>Compare casino information and bonus details.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <Search size={15} /> FIND NO DEPOSIT OFFERS
            </span>
            <h2>Compare No Deposit Casinos</h2>
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
            title="No deposit casinos coming soon"
            message="Nivaro is currently adding no deposit casino offers. Check back soon for new listings."
          />
        )}
      </section>

      <section className="section">
        <div className="page-title">
          <span className="eyebrow">NO DEPOSIT BONUS GUIDE</span>

          <h2>What Is a No Deposit Casino Bonus?</h2>

          <p>
            A no deposit casino bonus is a promotional offer that may allow
            eligible players to receive bonus funds or free spins without
            making an initial deposit. Availability, eligibility, wagering
            requirements and withdrawal conditions vary between casinos and
            promotions.
          </p>

          <h2>How to Compare No Deposit Casino Offers</h2>

          <p>
            Compare the bonus amount, free spins, wagering requirements,
            eligible games, expiration rules and withdrawal conditions before
            choosing an offer. Always check the casino&apos;s current terms and
            conditions because promotions can change.
          </p>
        </div>
      </section>
    </main>
  );
}