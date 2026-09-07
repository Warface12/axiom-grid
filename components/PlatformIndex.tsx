import Link from "next/link";
import { ArrowUpRight, Database, ShieldCheck } from "lucide-react";
import type { Platform, PlatformKind } from "@/lib/types";
import { PlatformDirectory } from "@/components/PlatformDirectory";
import { catalogById } from "@/lib/catalog";

export function PlatformIndex({ kind, items }: { kind: PlatformKind; items: Platform[] }) {
  const cat = catalogById(kind);
  const label = cat?.label || kind;
  if (items.length) return <PlatformDirectory items={items} />;
  return (
    <div className="ag-empty-directory">
      <div className="empty-index">
        <span>{(cat?.plural || kind).toUpperCase()} DIRECTORY</span>
        <h2>No reviewed public profiles yet.</h2>
        <p>This {label.toLowerCase()} directory is ready. Profiles appear after they are reviewed and published. TopPick does not insert sample companies.</p>
        <div className="empty-actions">
          <Link href="/how-we-rate">Review methodology <ArrowUpRight /></Link>
          <Link href="/learn">Read independent guides</Link>
        </div>
      </div>
      <div className="empty-visual">
        <Database />
        <div><b>0</b><span>PUBLIC RECORDS</span></div>
        <i />
        <div><ShieldCheck /><span>REVIEW BEFORE PUBLISH</span></div>
      </div>
    </div>
  );
}
