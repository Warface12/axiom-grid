import { catalogById } from "@/lib/catalog";
import { ProductHub, productHubMetadata } from "@/components/ProductHub";

const KIND = "broker" as const;
export async function generateMetadata() {
  return productHubMetadata(catalogById(KIND)!);
}
export default async function Page() {
  return <ProductHub cat={catalogById(KIND)!} />;
}
