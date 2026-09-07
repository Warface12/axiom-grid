import { notFound } from "next/navigation";
import { CATALOG, catalogByHub } from "@/lib/catalog";
import { ProductHub, productHubMetadata } from "@/components/ProductHub";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return CATALOG.filter((item) => !item.dedicated).map((item) => ({ category: item.hub }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const cat = catalogByHub(category);
  if (!cat || cat.dedicated) return { title: "Not found" };
  return productHubMetadata(cat);
}

export default async function Page({ params }: Props) {
  const { category } = await params;
  const cat = catalogByHub(category);
  if (!cat || cat.dedicated) notFound();
  return <ProductHub cat={cat} />;
}
