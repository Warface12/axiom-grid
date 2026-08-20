import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Privacy Policy — NivaroBet", description: "Read the NivaroBet privacy policy to understand what information may be processed, how analytics and site services are used, and what choices visitors have.", path: "/legal/privacy" });

export default function PrivacyPage() {
  return (
    <main className="container page legal-page">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Information We Collect</h2>
      <p>We may collect usage data, analytics and affiliate click tracking to improve our service. We do not sell personal data.</p>
      <h2>Cookies</h2>
      <p>See our <a href="/legal/cookies">Cookie Policy</a> for details on cookies and similar technologies.</p>
      <h2>Data Security</h2>
      <p>We use industry-standard security measures. Affiliate partner secrets are never stored in client-side code.</p>
      <h2>Contact</h2>
      <p>For privacy inquiries, contact contact@nivaro.com.</p>
    </main>
  );
}
