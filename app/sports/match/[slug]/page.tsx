import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getSportMatchBySlug } from "@/lib/data";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const match = await getSportMatchBySlug(slug);
  if (!match) return buildMetadata({ title: "Match Not Found", noIndex: true });
  const title = `${match.home_team?.name || "TBD"} vs ${match.away_team?.name || "TBD"}`;
  return buildMetadata({ title: `${title} — Nivaro Sports`, path: `/sports/match/${slug}` });
}

export default async function MatchDetailPage({ params }: Props) {
  const { slug } = await params;
  const match = await getSportMatchBySlug(slug);
  if (!match) notFound();

  const home = match.home_team?.name || "TBD";
  const away = match.away_team?.name || "TBD";

  return (
    <main className="container page">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Sports", href: "/sports" },
        { label: `${home} vs ${away}` },
      ]} />

      <div className="match-detail">
        <span className="eyebrow">{match.league?.name || "Match"} • {match.status.toUpperCase()}</span>
        <div className="match-scoreboard">
          <div><strong>{home}</strong><span>{match.home_score ?? "-"}</span></div>
          <div className="match-vs">vs</div>
          <div><strong>{away}</strong><span>{match.away_score ?? "-"}</span></div>
        </div>
        <p>{match.minute || (match.start_time ? new Date(match.start_time).toLocaleString() : "Time TBD")}</p>
        {match.venue && <p>Venue: {match.venue}</p>}
        <Link href="/sports" className="text-link">← Back to sports</Link>
      </div>
    </main>
  );
}
