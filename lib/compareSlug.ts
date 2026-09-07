export function parseComparisonParam(value: string) {
  return String(value || "")
    .split(/-vs-|\s+vs\s+/i)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 4);
}

export function comparisonPath(slugs: string[]) {
  return `/compare/${slugs.filter(Boolean).join("-vs-")}`;
}
