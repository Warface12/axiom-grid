import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Cookie Policy — NivaroBet", description: "Learn how NivaroBet may use essential cookies, analytics technologies and related browser storage, including the purposes they serve and available visitor controls.", path: "/legal/cookies" });

export default function CookiesPage() {
  return (
    <main className="container page legal-page">
      <h1>Cookie Policy</h1>
      <p>Nivaro uses cookies for analytics, session management and affiliate tracking.</p>
      <h2>Types of Cookies</h2>
      <ul>
        <li><strong>Essential:</strong> Required for site functionality</li>
        <li><strong>Analytics:</strong> Help us understand usage patterns</li>
        <li><strong>Affiliate:</strong> Track outbound clicks for commission reporting</li>
      </ul>
      <p>You can manage cookies through your browser settings.</p>
    </main>
  );
}
