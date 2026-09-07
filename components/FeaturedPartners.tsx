import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { getPublicPlatforms } from "@/lib/platforms";
import { platformPath } from "@/lib/catalog";

export async function FeaturedPartners() {
  const items = (await getPublicPlatforms(undefined, 12)).slice(0, 8);
  return (
    <section className="ag-partner-zone">
      <div className="ag-section-marker">TOPPICK / PUBLISHED RESEARCH</div>
      <div className="ag-partner-head">
        <div>
          <h2>Platforms we research</h2>
          <p>This strip stays empty until an editor publishes a reviewed record. It is not filled with sample exchanges or wallets.</p>
        </div>
        <Link href="/compare">Compare platforms <ArrowUpRight /></Link>
      </div>
      {items.length ? (
        <div className="ag-partner-strip">
          {items.map((p) => (
            <Link href={platformPath(p.kind, p.slug)} className="ag-partner-pill" key={p.slug}>
              {p.logoUrl ? <img src={p.logoUrl} alt="" width={34} height={34} /> : <span>{p.logoText}</span>}
              <div>
                <b>{p.name}</b>
                <small>{p.kind}</small>
              </div>
              {p.status === "verified" && <BadgeCheck />}
            </Link>
          ))}
        </div>
      ) : (
        <div className="ag-partner-empty">
          <b>No public partner profiles yet.</b>
          <span>When you add a real platform in Admin, it remains hidden until you choose to publish it.</span>
        </div>
      )}
    </section>
  );
}
