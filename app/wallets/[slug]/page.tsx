import { catalogById } from "@/lib/catalog";
import { ProductProfile, productProfileMetadata } from "@/components/ProductProfile";

const KIND = "wallet" as const;
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  return productProfileMetadata(catalogById(KIND)!, (await params).slug);
}
export default async function Page({ params }: Props) {
  return <ProductProfile cat={catalogById(KIND)!} slug={(await params).slug} />;
}
