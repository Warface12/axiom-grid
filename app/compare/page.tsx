import { GitCompare } from "lucide-react";
import { CompareClient } from "@/components/CompareClient";
import { EmptyState } from "@/components/GuideCard";
import { getCasinos, getCasinosByIds } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ ids?: string }> };

export const metadata = buildMetadata({
  title: "Compare Casinos — NivaroBet",
  description: "Compare casino ratings, bonuses, payment methods, licensing and availability side by side.",
  path: "/compare",
});

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const allCasinos = await getCasinos();
  const selectedIds = params.ids?.split(",").filter(Boolean) || [];
  const selectedCasinos = selectedIds.length ? await getCasinosByIds(selectedIds) : [];

  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow"><GitCompare size={15} /> COMPARE</span>
        <h1>Compare casinos side by side.</h1>
        <p>Select up to 4 casinos and compare ratings, bonuses, payments and more.</p>
      </div>

      {allCasinos.length ? (
        <CompareClient casinos={selectedCasinos.length >= 2 ? selectedCasinos : allCasinos} />
      ) : (
        <EmptyState title="No casinos to compare" message="Add casinos in Admin first." actionHref="/admin/casinos" actionLabel="Manage Casinos" />
      )}
    </main>
  );
}
