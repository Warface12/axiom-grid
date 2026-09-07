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
          <p>Reviewed company profiles appear here. Until then, use categories, the finder and guides — never sample brands.</p>
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
        <div className="ag-partner-empty tp-discover-empty">
          <b>Explore while the directory grows.</b>
          <span>Published company profiles appear here after review — never as sample brands. Start with a category, the finder, or a guide.</span>
          <div className="tp-empty-links">
            <Link href="/exchanges">Exchanges</Link>
            <Link href="/wallets">Wallets</Link>
            <Link href="/brokers">Brokers</Link>
            <Link href="/finder">Finder</Link>
            <Link href="/learn">Guides</Link>
          </div>
        </div>
      )}
    </section>
  );
}
