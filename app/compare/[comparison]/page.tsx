import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getPublicPlatform } from "@/lib/platforms";
import { CompareClient } from "@/components/CompareClient";
import { parseComparisonParam } from "@/lib/compareSlug";

type Props = { params: Promise<{ comparison: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { comparison } = await params;
  const slugs = parseComparisonParam(comparison);
  const found = (await Promise.all(slugs.map((slug) => getPublicPlatform(slug)))).filter(Boolean);
  if (found.length < 2) return buildMetadata({ title: "Comparison not found", path: `/compare/${comparison}`, noIndex: true });
  const names = found.map((p) => p!.name).join(" vs ");
  return buildMetadata({
    title: `${names} — TopPick.pro`,
    description: `Side-by-side comparison of published research profiles: ${names}. Undisclosed fields stay empty.`,
    path: `/compare/${comparison}`,
  });
}

export default async function Page({ params }: Props) {
  const { comparison } = await params;
  const slugs = parseComparisonParam(comparison);
  const found = (await Promise.all(slugs.map((slug) => getPublicPlatform(slug)))).filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (found.length < 2) notFound();
  return (
    <main className="shell content-shell">
      <section className="page-hero">
        <span>COMPARE</span>
        <h1>{found.map((p) => p.name).join(" vs ")}</h1>
        <p>Only published, market-visible profiles are compared. Missing facts are shown as not disclosed.</p>
      </section>
      <CompareClient platforms={found} initialIds={found.map((p) => p.id || p.slug)} />
    </main>
  );
}
