import Link from "next/link";
import type { CatalogKind } from "@/lib/catalog";

export function EmptyGuide({ cat }: { cat: CatalogKind }) {
  const questions = Array.from(new Set([
    ...cat.attributes.map((a) => a.label),
    ...cat.compareKeys.map((key) => cat.attributes.find((a) => a.key === key)?.label || key.replace(/_/g, " ")),
  ])).slice(0, 8);
  return (
    <div className="tp-empty-guide">
      <h2>How to research {cat.plural.toLowerCase()}</h2>
      <ul>
        {questions.map((q) => <li key={q}>{q}</li>)}
      </ul>
      <div className="tp-continue">
        <Link href="/finder">Use the finder</Link>
        <Link href="/compare">Compare like with like</Link>
        <Link href="/learn">Read a guide</Link>
        <Link href="/markets">Check your market</Link>
      </div>
    </div>
  );
}
