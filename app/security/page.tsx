import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { SecurityVault } from "@/components/visual/SecurityVault";

export const metadata = buildMetadata({
  title: "Security & custody — TopPick.pro",
  description: "A practical orientation to custody, keys, phishing and venue risk.",
  path: "/security",
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>LEARN / SECURITY</span>
        <h1>Who can move the asset?</h1>
        <p>That is the first security question. An exchange balance, a custodial wallet and a hardware device fail in different ways.</p>
      </section>
      <SecurityVault />
      <section className="shell legal-page">
        <p>Self-custody removes venue counterparty risk and introduces backup, phishing and device-compromise risk. Neither model is universally safer.</p>
        <p className="tp-chapter-links">
          <Link href="/learn/self-custody-basics">Self-custody basics</Link>
          <Link href="/learn/exchange-vs-wallet">Exchange vs wallet</Link>
          <Link href="/wallets">Wallet directory</Link>
        </p>
      </section>
    </main>
  );
}
