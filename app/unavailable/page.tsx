import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Partner link unavailable — TopPick.pro",
  description: "This commercial link is not currently available for the detected market.",
  path: "/unavailable",
  noIndex: true,
});

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams;
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Compliance gate</span>
        <h1>Partner link unavailable.</h1>
        <p>TopPick keeps promotional links disabled when market eligibility is unknown, expired or restricted. You can still read the research profile.</p>
        {p.market ? <p>Detected market: {p.market}</p> : null}
      </section>
      <p className="tp-chapter-links shell">
        <Link href="/compare">Back to comparisons</Link>
        <Link href="/markets">Markets</Link>
        <Link href="/jobs">Jobs</Link>
      </p>
    </main>
  );
}
