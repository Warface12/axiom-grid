export type VisualTier = "high" | "balanced" | "lite";

export function detectVisualTier(): VisualTier {
  if (typeof window === "undefined") return "balanced";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = "connection" in navigator && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const narrow = window.innerWidth < 720;
  if (reduce || saveData || memory <= 2 || cores <= 2) return "lite";
  if (narrow || memory <= 4 || cores <= 4) return "balanced";
  return "high";
}
