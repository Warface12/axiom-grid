import { buildMetadata } from "@/lib/seo";
import { countPublished } from "@/lib/publicInventory";

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
      <section className="shell page-hero">
        <span>EVENTS</span>
        <h1>Dates, sources, terms — or it does not ship.</h1>
        <p>Partner-submitted events require a real source and schedule. This route is noindex while the calendar is empty.</p>
      </section>
      <section className="shell content-shell">
        <div className="tp-state-card">
          <b>{count ? `${count} published events` : "No published events"}</b>
        </div>
      </section>
    </main>
  );
}
