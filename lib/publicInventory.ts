import { adminDb } from "@/lib/adminDb";

export async function countPublished(table: "offer" | "event_record" | "external_game") {
  const db = adminDb();
  if (!db) return 0;
  const { count, error } = await db.from(table).select("id", { count: "exact", head: true }).eq("status", "active");
  if (error) return 0;
  return count || 0;
}
