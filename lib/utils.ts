export const SITE_NAME = "NivaroBet";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nivarobet.best";
export const SITE_DESCRIPTION =
  "Premium casino discovery, bonus comparison and monitored market guide.";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatRating(rating: number): string {
  return Number(rating).toFixed(1);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 0) return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(d);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 31) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export function accentFromIndex(index: number): "red" | "violet" | "cyan" {
  const accents: ("red" | "violet" | "cyan")[] = ["red", "violet", "cyan"];
  return accents[index % accents.length];
}

export function casinoTags(c: {
  no_deposit?: boolean;
  free_spins?: boolean;
  crypto?: boolean;
  payment_methods?: string[];
}): string[] {
  const tags: string[] = [];
  if (c.no_deposit) tags.push("No Deposit");
  if (c.free_spins) tags.push("Free Spins");
  if (c.crypto) tags.push("Crypto");
  if (c.payment_methods?.length) tags.push(c.payment_methods[0]);
  return tags.slice(0, 4);
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function joinList(arr: string[] | null | undefined): string {
  return (arr || []).join(", ");
}

export function generateVisitorId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
