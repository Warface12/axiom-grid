import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import type { Bonus } from "@/lib/types";

type Props = {
  bonus: Pick<Bonus, "id" | "slug" | "title" | "type" | "amount" | "verified_at" | "expires_at" | "casino_id"> & {
    casino?: Pick<NonNullable<Bonus["casino"]>, "name" | "slug"> | null;
  };
};

function toneFrom(text: string) {
  const n = [...text].reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  return ["violet", "green", "red"][n];
}

export function BonusCard({ bonus }: Props) {
  const tone = toneFrom(bonus.title);
  return (
    <article className={`ref-bonus-card tone-${tone}`}>
      <div className="ref-bonus-light" />
      <div className="ref-bonus-heading">
        <div><h3>{bonus.amount || bonus.title}</h3><p>{bonus.type || "Welcome Bonus"}</p></div>
        <span className="ref-new">NEW</span>
      </div>
      <div className="ref-bonus-art" aria-hidden="true"><Gift size={74}/><i/><i/><i/></div>
      <div className="ref-bonus-footer">
        <strong>{bonus.casino?.name || "Featured casino"}</strong>
        <Link href={`/bonuses/${bonus.slug}`} aria-label={`View ${bonus.title}`}><ArrowRight size={18}/></Link>
      </div>
    </article>
  );
}
