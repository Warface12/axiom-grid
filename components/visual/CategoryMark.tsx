import { signatureFor } from "@/lib/visual/signatures";

export function CategoryMark({ id, className = "" }: { id?: string | null; className?: string }) {
  const sig = signatureFor(id);
  return (
    <span className={`tp-cat-mark tp-cat-mark--${sig.object} ${className}`} style={{ ["--sig" as string]: sig.accent, ["--glow" as string]: sig.glow }} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
