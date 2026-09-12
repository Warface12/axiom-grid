import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy — TopPick.pro",
  description: "Privacy information for TopPick.pro, including operational data, analytics, security and third-party links.",
  path: "/legal/privacy",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Legal</span>
        <h1>Privacy</h1>
        <p>TopPick.pro is designed to collect only data reasonably needed to operate, secure and improve the service. Administrative credentials and private service keys are handled server-side and should never be exposed in public client code.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>Operational and analytics data</b><p>Standard technical data such as request information, device or browser characteristics, aggregate usage metrics and error logs may be processed by hosting, analytics or security providers. We use this to understand performance, protect the service and improve navigation.</p></article>
        <article className="tp-start-card"><b>Third-party providers</b><p>When you follow a link to a broker, exchange, wallet or another external service, that provider may collect information under its own privacy policy. TopPick does not control those practices.</p></article>
        <article className="tp-start-card"><b>Affiliate attribution</b><p>Partner links may contain tracking parameters used by the provider or affiliate network. The technology and retention period are determined by the relevant third party.</p></article>
        <article className="tp-start-card"><b>Security</b><p>Private administrative access uses server-side authorization. Secrets must be stored in deployment environment variables rather than committed to source code.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/legal/cookies">Cookies</Link>
        <Link href="/legal/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </p>
    </main>
  );
}
