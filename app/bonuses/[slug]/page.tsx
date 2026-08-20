import { notFound, redirect } from "next/navigation";
import { getBonusBySlug } from "@/lib/data";
export default async function BonusLegacyRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bonus = await getBonusBySlug(slug);
  if (!bonus?.casino?.slug) notFound();
  redirect(`/casinos/${bonus.casino.slug}#offers`);
}
