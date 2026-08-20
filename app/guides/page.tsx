import { BookOpen } from "lucide-react";
import { GuideCard, EmptyState } from "@/components/GuideCard";
import { getGuides, getSeoSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() { const seo = await getSeoSettings("guides"); return buildMetadata({ title: seo?.title, description: seo?.description, path: "/guides" }); }
export default async function GuidesPage() {
  const guides = await getGuides();
  return <main className="container ref-inner-page"><div className="ref-breadcrumb">Home <span>›</span> Guides</div><header className="ref-page-header"><h1>GUIDES</h1><p>Expert guides and tips to help you make the most of your online casino experience.</p></header>{guides.length ? <div className="ref-guide-grid ref-guide-page-grid">{guides.map(g => <GuideCard key={g.slug} guide={g}/>)}</div> : <EmptyState title="No guides published" message="Publish guides from Admin to build your content library."/>}</main>;
}
