import { buildMetadata } from "@/lib/seo";
import { countPublished } from "@/lib/publicInventory";
import Link from "next/link";

export async function generateMetadata() {
  const count = await countPublished("event_record");
  return buildMetadata({
    title: "Crypto events",
    description: "Launches, AMAs, competitions and educational sessions with dates and official sources.",
    path: "/events",
    noIndex: count === 0,
  });
}

export default async function Page() {
  const count = await countPublished("event_record");
  return (
    <main>
      <section className="shell tp-hub-hero">
        <p>EVENTS</p>
        <h1>Dates and sources, or it does not appear.</h1>
        <p>Listed events need a real schedule and a source. Until then, use the research library.</p>
      </section>
      <section className="shell content-shell">
        {count ? (
          <p>{count} published events</p>
        ) : (
          <div className="tp-empty-guide">
            <h2>No events on the calendar</h2>
            <p>When a reviewed session is published, it shows up here with dates and terms.</p>
            <div className="tp-continue">
              <Link href="/learn">Guides</Link>
              <Link href="/markets">Markets</Link>
              <Link href="/opportunities">Opportunities</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
