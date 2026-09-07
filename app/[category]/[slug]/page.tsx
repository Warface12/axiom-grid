import { notFound } from "next/navigation";
import { catalogByHub } from "@/lib/catalog";
import { ProductProfile, productProfileMetadata } from "@/components/ProductProfile";

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  const cat = catalogByHub(category);
  if (!cat || cat.dedicated) return { title: "Not found" };
  return productProfileMetadata(cat, slug);
}

export default async function Page({ params }: Props) {
  const { category, slug } = await params;
  const cat = catalogByHub(category);
  if (!cat || cat.dedicated) notFound();
  return <ProductProfile cat={cat} slug={slug} />;
}
