import { Bitcoin, ShieldCheck, Search, WalletCards } from "lucide-react";
import { CasinoCard } from "@/components/CasinoCard";
import { EmptyState } from "@/components/GuideCard";
import { getCasinos } from "@/lib/data";
import { accentFromIndex } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Best Crypto Casinos ${currentYear} | Bitcoin Casino Sites | Nivaro`,
  description:
    `Discover crypto casinos for ${currentYear}. Compare Bitcoin casinos, cryptocurrency-friendly casino sites, bonuses and available offers on Nivaro.`,
  keywords: [
    "crypto casinos",
    "best crypto casinos",
    "bitcoin casinos",
    "bitcoin casino sites",
    "cryptocurrency casinos",
    "crypto casino bonuses",
    "online crypto casinos",
    "bitcoin casino bonus",
    "crypto gambling sites",
    "online casinos",
    "casino bonuses",
  ],
  alternates: {
    canonical: "/crypto-casinos",
  },
  openGraph: {
    title: `Best Crypto Casinos ${currentYear} | Nivaro`,
    description:
      "Compare crypto casinos, Bitcoin casino sites, bonuses and cryptocurrency-friendly casino options on Nivaro.",
    type: "website",
  },
};

export default async function CryptoCasinosPage() {
  const casinos = await getCasinos({
    crypto: true,
    limit: 50,
  });

  return (
    <main className="container page">
      <section className="page-title">
        <span className="eyebrow">
          <Bitcoin size={15} /> CRYPTO CASINO DISCOVERY
        </span>

        <h1>Best Crypto Casinos {currentYear}</h1>

        <p>
          Explore online casinos that support cryptocurrency-related features.
          Compare Bitcoin and crypto-friendly casinos, available bonuses,
          payment options and other important information in one place.
        </p>
      </section>

      <section className="trust-strip">
        <div>
          <Bitcoin />
          <strong>Crypto Casinos</strong>
          <span>Discover casinos with cryptocurrency support.</span>
        </div>

        <div>
          <WalletCards />
          <strong>Payment Options</strong>
          <span>Compare available crypto and other payment methods.</span>
        </div>

        <div>
          <ShieldCheck />
          <strong>Clear Comparisons</strong>
          <span>Review casino features and offer details before choosing.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <Search size={15} /> EXPLORE CRYPTO CASINOS
            </span>
            <h2>Compare Crypto Casino Sites</h2>
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
            title="Crypto casinos coming soon"
            message="Nivaro is currently adding crypto-friendly casino listings. Check back soon for new options."
          />
        )}
      </section>

      <section className="section">
        <div className="page-title">
          <span className="eyebrow">CRYPTO CASINO GUIDE</span>

          <h2>What Is a Crypto Casino?</h2>

          <p>
            A crypto casino is an online casino that supports one or more
            cryptocurrencies as part of its payment options or account
            experience. Supported currencies, deposit methods, withdrawal rules
            and availability vary between operators.
          </p>

          <h2>How to Compare Crypto Casinos</h2>

          <p>
            Compare supported cryptocurrencies, payment processing information,
            available bonuses, withdrawal conditions, game selection and other
            casino features. Always check the operator&apos;s current terms and
            availability for your location.
          </p>
        </div>
      </section>
    </main>
  );
}