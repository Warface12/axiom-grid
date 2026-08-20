import { Trophy, ShieldCheck, Star } from "lucide-react";
import { CasinoCard } from "@/components/CasinoCard";
import { EmptyState } from "@/components/GuideCard";
import { getCasinos } from "@/lib/data";
import { accentFromIndex } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Best Online Casinos ${currentYear} | Top Rated Casino Sites | Nivaro`,
  description:
    `Discover the best online casinos for ${currentYear}. Compare top-rated casino sites, bonuses, free spins, crypto options and trusted offers on Nivaro.`,
  keywords: [
    "best online casinos",
    "best casino sites",
    "top online casinos",
    "online casino",
    "casino sites",
    "top rated casinos",
    "trusted online casinos",
    "online casino bonuses",
    "best casino bonuses",
    "casino bonus",
    "welcome bonus casinos",
    "no deposit casinos",
    "no deposit casino bonuses",
    "free spins casinos",
    "crypto casinos",
    "bitcoin casinos",
    "new online casinos",
    "real money casinos",
  ],
  alternates: {
    canonical: "/best-online-casinos",
  },
  openGraph: {
    title: `Best Online Casinos ${currentYear} | Nivaro`,
    description:
      "Compare top-rated online casinos, bonuses, free spins, crypto options and trusted casino offers.",
    type: "website",
  },
};

export default async function BestOnlineCasinosPage() {
  const casinos = await getCasinos({ limit: 50 });

  return (
    <main className="container page">
      <section className="page-title">
        <span className="eyebrow">
          <Trophy size={15} /> NIVARO CASINO RANKINGS
        </span>

        <h1>Best Online Casinos {currentYear}</h1>

        <p>
          Discover and compare top-rated online casinos in one place. Explore
          casino bonuses, welcome offers, free spins, crypto options and other
          features to find a casino that matches what you are looking for.
        </p>
      </section>

      <section className="trust-strip">
        <div>
          <ShieldCheck />
          <strong>Casino Discovery</strong>
          <span>Compare casino offers and important information.</span>
        </div>

        <div>
          <Star />
          <strong>Top Rated Casinos</strong>
          <span>Browse casinos ordered by their current rating.</span>
        </div>

        <div>
          <Trophy />
          <strong>Bonus Comparison</strong>
          <span>Explore welcome bonuses, free spins and other offers.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TOP CASINO SITES</span>
            <h2>Compare Online Casinos</h2>
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
            title="Casino rankings coming soon"
            message="Nivaro is currently adding and reviewing casino listings. Check back soon for our casino comparisons."
          />
        )}
      </section>

      <section className="section">
        <div className="page-title">
          <span className="eyebrow">ONLINE CASINO GUIDE</span>
          <h2>How to Compare Online Casinos</h2>

          <p>
            When comparing online casinos, consider the available bonuses,
            payment methods, game selection, supported currencies and other
            important features. Nivaro organizes casino information so visitors
            can compare different options more easily.
          </p>
        </div>
      </section>
    </main>
  );
}