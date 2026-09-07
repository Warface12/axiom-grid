import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Editorial policy — TopPick.pro",
  description: "How TopPick separates research, partner compensation and unpublished facts.",
  path: "/editorial-policy",
});

export default function Page() {
  return (
    <main className="shell legal-page">
      <span>EDITORIAL</span>
      <h1>Editorial policy</h1>
      <p>TopPick publishes comparison research. It is not an exchange, broker, wallet issuer or financial adviser.</p>
      <h2>What we will not invent</h2>
      <p>Fees, licenses, ratings, availability and affiliate destinations stay empty until a sourced record exists. Empty is a valid public state.</p>
      <h2>Partner relationships</h2>
      <p>Advertising, affiliate and tracking are independent. A company may advertise with no affiliate contract. Compensation is not a ranking.</p>
      <h2>Corrections</h2>
      <p>If a published fact is wrong, we correct the record rather than quietly overwriting history. See the corrections page.</p>
    </main>
  );
}
