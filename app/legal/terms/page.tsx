import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Terms of Service — NivaroBet", description: "Read the terms that govern use of NivaroBet, including informational content, affiliate links, market availability, third-party operators and limitations of responsibility.", path: "/legal/terms" });

export default function TermsPage() {
  return (
    <main className="container page legal-page">
      <h1>Terms of Service</h1>
      <p>By using Nivaro, you agree to these terms. Nivaro provides informational content about online casinos and sports. We are not a gambling operator.</p>
      <h2>Eligibility</h2>
      <p>You must be 18+ and comply with local laws regarding online gambling.</p>
      <h2>Affiliate Links</h2>
      <p>We may earn commissions through affiliate links. See our Affiliate Disclosure.</p>
      <h2>Disclaimer</h2>
      <p>Information is provided as-is. Always verify offers on the partner site before claiming.</p>
    </main>
  );
}
