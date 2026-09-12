import Link from "next/link";
import { buildMetadata, webPageJsonLd, itemListJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { RESEARCH_JOBS } from "@/lib/jobs";

export const metadata = buildMetadata({
  title: "Crypto jobs — what you are actually trying to do",
  description: "Map a real job to product classes: buy crypto, hold keys, trade perps, move across chains, research fees, or check a market.",
  path: "/jobs",
  keywords: ["buy crypto", "self custody", "crypto futures", "cross chain bridge", "crypto tax software"],
});

export default function Page() {
  const schema = webPageJsonLd({ name: "TopPick jobs", description: "Job-based map into product classes.", path: "/jobs" });
  const list = itemListJsonLd(RESEARCH_JOBS.map((job) => ({ name: job.title, url: `${SITE_URL}${job.href}` })));
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Jobs", url: `${SITE_URL}/jobs` },
  ]);
  return (
    <main className="tp-jobs-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="shell page-hero">
        <span>Jobs</span>
        <h1>Start from the work, not the brand.</h1>
        <p>Each job opens a researched class. If that class has no reviewed profile yet, the directory stays empty.</p>
      </section>
      <div className="tp-jobs-grid">
        {RESEARCH_JOBS.map((job) => (
          <Link key={job.href} href={job.href} className="tp-job-card">
            <b>{job.title}</b>
            <p>{job.copy}</p>
          </Link>
        ))}
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/finder">Guided finder</Link>
        <Link href="/niches">All niches</Link>
        <Link href="/start">How to start</Link>
      </p>
    </main>
  );
}
