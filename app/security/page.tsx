import { buildMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import { SecurityVault } from "@/components/visual/SecurityVault";

export const metadata = buildMetadata({
  title: "Security & custody — TopPick.pro",
  description: "Who can move the asset: exchange balances, custodial wallets and hardware devices fail in different ways.",
  path: "/security",
  keywords: ["crypto custody", "self custody", "hardware wallet", "exchange risk"],
});

const QA = [
  { question: "Is self-custody always safer?", answer: "No. It removes venue counterparty risk and introduces backup, phishing and device-compromise risk. Neither model is universally safer." },
  { question: "What is the first security question?", answer: "Who can move the asset, and what happens if that party pauses, is hacked, or loses the recovery secret." },
];

export default function Page() {
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Security", url: `${SITE_URL}/security` },
  ]);
  return (
    <main className="tp-start-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(QA)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="shell page-hero">
        <span>Security</span>
        <h1>Who can move the asset?</h1>
        <p>An exchange balance, a custodial wallet and a hardware device fail in different ways. Compare the failure mode, not a padlock icon.</p>
      </section>
      <SecurityVault />
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>Venue balance</b><p>The operator can freeze, throttle or lose withdrawals. You hold an account claim.</p></article>
        <article className="tp-start-card"><b>Custodial wallet</b><p>Keys sit with a vendor. Recovery is an account process, not a seed you control.</p></article>
        <article className="tp-start-card"><b>Self-custody</b><p>You authorize transfers. Anyone with the recovery secret can move funds.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/learn/self-custody-basics">Self-custody basics</Link>
        <Link href="/learn/exchange-vs-wallet">Exchange vs wallet</Link>
        <Link href="/wallets">Wallet directory</Link>
        <Link href="/custody">Institutional custody</Link>
      </p>
    </main>
  );
}
