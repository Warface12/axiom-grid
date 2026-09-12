import Link from "next/link";
import { buildMetadata, webPageJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = buildMetadata({
  title: "How to start on TopPick.pro",
  description: "Four working paths: find a product class, compare like with like, check your market, then read custody and fees before you act.",
  path: "/start",
  keywords: ["how to choose a crypto exchange", "wallet vs exchange", "crypto comparison", "product finder"],
});

const STEPS = [
  { href: "/finder", title: "Find the class", copy: "Start from the job — buy crypto, hold keys, use a broker, move across chains — not from a brand list." },
  { href: "/compare", title: "Compare like with like", copy: "Exchange versus exchange. Wallet versus wallet. Undisclosed fees and licenses stay empty." },
  { href: "/markets", title: "Check your country", copy: "Availability and whether TopPick can promote a product are different questions, stored per market." },
  { href: "/learn", title: "Learn the failure mode", copy: "Custody, fees, brokers versus exchanges, bridges and stablecoins — written as research, not tips." },
];

export default function Page() {
  const schema = webPageJsonLd({
    name: "How to start on TopPick",
    description: "A short path through finder, compare, markets and learn.",
    path: "/start",
  });
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Start", url: `${SITE_URL}/start` },
  ]);
  const faq = faqJsonLd([
    { question: "Is TopPick a ranking site?", answer: "No. TopPick publishes comparison research by product class. Empty directories stay empty instead of filling with invented brands." },
    { question: "Do I need an account?", answer: "No. Research pages are public. An account is only for saving, following and notifications across devices." },
  ]);
  return (
    <main className="tp-start-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <section className="shell page-hero">
        <span>Start here</span>
        <h1>Four doors. No invented ranking.</h1>
        <p>Use the finder if you know the job. Compare if you already have two products. Open a niche if you already know the class. Check your market before you treat a button as available.</p>
      </section>
      <div className="tp-start-grid">
        {STEPS.map((step, index) => (
          <Link key={step.href} href={step.href} className="tp-start-card">
            <small>0{index + 1}</small>
            <b>{step.title}</b>
            <p>{step.copy}</p>
          </Link>
        ))}
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/jobs">Browse jobs</Link>
        <Link href="/niches">All niches</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/account">Save research</Link>
      </p>
    </main>
  );
}
