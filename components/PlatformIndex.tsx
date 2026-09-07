import Link from "next/link";
import type { Platform, PlatformKind } from "@/lib/types";
import { PlatformDirectory } from "@/components/PlatformDirectory";
import { catalogById } from "@/lib/catalog";
import { EmptyGuide } from "@/components/EmptyGuide";

export function PlatformIndex({ kind, items }: { kind: PlatformKind; items: Platform[] }) {
  const cat = catalogById(kind);
  if (items.length) return <PlatformDirectory items={items} />;
  if (!cat) return null;
  return <EmptyGuide cat={cat} />;
}
