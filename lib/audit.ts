import { adminDb } from "@/lib/adminDb";

export async function writeAudit(input: { actor?: string | null; action: string; entity?: string; entityId?: string; meta?: Record<string, unknown> }) {
  const db = adminDb();
  if (!db) return;
  await db.from("audit_log").insert({
    actor: input.actor || null,
    action: input.action,
    entity: input.entity || null,
    entity_id: input.entityId || null,
    meta: input.meta || {},
  });
}
