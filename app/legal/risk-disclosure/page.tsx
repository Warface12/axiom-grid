import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Risk disclosure — TopPick.pro",
  description: "Trading and digital-asset risk disclosure for TopPick research users.",
  path: "/legal/risk-disclosure",
});

export default function Page() {
  return (
    <main className="shell legal-page">
      <span>LEGAL / RISK</span>
      <h1>Risk disclosure</h1>
      <p>Cryptoassets and leveraged trading can result in the loss of some or all of your capital. Past performance is not a reliable indicator of future results.</p>
      <p>TopPick does not provide personal investment, tax or legal advice. Product availability, client money protections and dispute venues vary by country and by legal entity.</p>
      <p>Promotional offers may include conditions, expiry dates, KYC and restricted markets. In-game or loyalty points are not cash unless a sourced record says otherwise.</p>
    </main>
  );
}
