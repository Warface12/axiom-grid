export function AxiomMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`axiom-mark${compact ? " axiom-mark-compact" : ""}`} aria-hidden="true">
      <i/><i/><i/><i/>
    </span>
  );
}
