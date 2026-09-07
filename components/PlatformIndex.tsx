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
        <p>This {label.toLowerCase()} directory is ready. Records appear here only after they are reviewed and published in Admin. TopPick does not insert sample companies.</p>
        <div className="empty-actions">
          <Link href="/how-we-rate">Review methodology <ArrowUpRight /></Link>
          <Link href="/markets">Browse market framework</Link>
        </div>
      </div>
      <div className="empty-visual">
        <Database />
        <div><b>0</b><span>PUBLIC RECORDS</span></div>
        <i />
        <div><ShieldCheck /><span>FAIL-CLOSED PUBLISHING</span></div>
      </div>
    </div>
  );
}
