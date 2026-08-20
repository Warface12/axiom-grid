import Link from "next/link";
import { ArrowRight, Clock3, FileSearch, RefreshCw, ShieldCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Casino Research Updates & Change Desk | NivaroBet",
  description: "See how NivaroBet approaches freshness, change history, market reviews and evidence maintenance.",
  path: "/updates",
});

export default function UpdatesPage(){
  return <main className="nvx-static-page container">
    <header className="nvx-static-hero"><small>CHANGE DESK</small><h1>Research should show when the ground moves.</h1><p>Casino offers, operator details and market availability are not permanent facts. The Nivaro change desk is the publishing layer for freshness, review queues and evidence maintenance.</p></header>
    <section className="nvx-update-principles">
      <article><RefreshCw size={20}/><span>01</span><h2>Refresh</h2><p>Profiles and offers can be queued for review when important information becomes stale.</p></article>
      <article><FileSearch size={20}/><span>02</span><h2>Compare evidence</h2><p>New information should be checked against existing sources before replacing a published fact.</p></article>
      <article><ShieldCheck size={20}/><span>03</span><h2>Re-gate markets</h2><p>Eligibility and promotional permission may need renewed review when market conditions change.</p></article>
      <article><Clock3 size={20}/><span>04</span><h2>Record timing</h2><p>Dates and change notes provide context that a silent overwrite cannot.</p></article>
    </section>
    <section className="nvx-static-cta"><div><b>Want the methodology behind this?</b><p>See how review evidence and market checks fit into the broader publication workflow.</p></div><Link href="/how-we-verify">Verification framework <ArrowRight size={15}/></Link></section>
  </main>;
}
