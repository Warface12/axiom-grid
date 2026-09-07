import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Fees education — TopPick.pro",
  description: "How to compare maker/taker fees, spreads, funding and withdrawals without invented numbers.",
  path: "/fees",
});

export default function Page() {
  return (
    <main className="shell legal-page">
      <span>LEARN / FEES</span>
      <h1>Fees, without the marketing headline</h1>
      <p>A published maker/taker table is a starting point. Spread, conversion, funding, withdrawal and inactivity charges can dominate smaller accounts.</p>
      <p>TopPick will not estimate a fee that the operator has not published on a reviewed record.</p>
      <p><Link href="/learn/crypto-fees-explained">Read the fees guide</Link></p>
    </main>
  );
}
