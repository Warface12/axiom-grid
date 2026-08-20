import Link from "next/link";
import { Activity, Clock } from "lucide-react";
import type { SportMatch } from "@/lib/types";

type Props = {
  match: SportMatch;
};

export function LiveScore({ match }: Props) {
  const home = match.home_team?.name || "TBD";
  const away = match.away_team?.name || "TBD";
  const league = match.league?.name || "Match";
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const homeScore = match.home_score ?? "-";
  const awayScore = match.away_score ?? "-";
  const statusLabel = isLive ? "LIVE" : isFinished ? "FT" : match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Upcoming";

  return (
    <article className="score-card">
      <div className="score-head">
        <span>{league}</span>
        {isLive ? (
          <b><Activity size={13} /> LIVE</b>
        ) : (
          <span className="score-status"><Clock size={12} /> {statusLabel}</span>
        )}
      </div>
      <div className="team"><span>{home}</span><strong>{homeScore}</strong></div>
      <div className="team"><span>{away}</span><strong>{awayScore}</strong></div>
      <div className="score-foot">
        <span>{match.minute || statusLabel}</span>
        <Link href={`/sports/match/${match.slug}`}>Match centre →</Link>
      </div>
    </article>
  );
}
