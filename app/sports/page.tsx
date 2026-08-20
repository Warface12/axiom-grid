import { Activity, Search } from "lucide-react";
import Link from "next/link";
import { LiveScore } from "@/components/LiveScore";
import { EmptyState } from "@/components/GuideCard";
import { getSportCategories, getSportMatches, getSeoSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ status?: string; category?: string; q?: string; team?: string; league?: string }> };

export async function generateMetadata() {
  const seo = await getSeoSettings("sports");
  return buildMetadata({ title: seo?.title, description: seo?.description, path: "/sports" });
}

export default async function SportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status || "live";
  const categories = await getSportCategories();
  const [live, upcoming, finished] = await Promise.all([
    getSportMatches({ status: "live", categorySlug: params.category, search: params.q }),
    getSportMatches({ status: "scheduled", categorySlug: params.category, search: params.q, limit: 12 }),
    getSportMatches({ status: "finished", categorySlug: params.category, search: params.q, limit: 12 }),
  ]);

  const activeMatches = status === "upcoming" ? upcoming : status === "results" ? finished : live;

  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow"><Activity size={15} /> LIVE SPORTS</span>
        <h1>Every game. One place.</h1>
        <p>Live scores, fixtures, results and match data through an official sports data provider.</p>
      </div>

      <form className="filterbar" action="/sports" method="get">
        <div className="mini-search">
          <Search size={18} />
          <input name="q" placeholder="Search teams, leagues, matches..." defaultValue={params.q || ""} />
        </div>
        <div className="chips">
          <Link href="/sports?status=live" className={status === "live" ? "chip-active" : ""}>Live</Link>
          <Link href="/sports?status=upcoming" className={status === "upcoming" ? "chip-active" : ""}>Upcoming</Link>
          <Link href="/sports?status=results" className={status === "results" ? "chip-active" : ""}>Results</Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/sports?category=${c.slug}&status=${status}`}>{c.name}</Link>
          ))}
        </div>
      </form>

      {activeMatches.length ? (
        <div className="sports-grid">{activeMatches.map((m) => <LiveScore key={m.id} match={m} />)}</div>
      ) : (
        <EmptyState
          title="No matches available"
          message="Sports data will appear here once connected to an authorized sports data API. No placeholder live results are shown."
          actionHref="/admin/integrations"
          actionLabel="Configure Integration"
        />
      )}

      <div className="notice">
        Live data must be connected to a licensed/authorized sports data API. Configure integrations in Admin when your provider credentials are ready.
      </div>
    </main>
  );
}
