import { adminDb } from "@/lib/adminDb";
import type { PartnerRole } from "@/lib/ecosystem";
import { assertSameTenant } from "@/lib/ecosystem";

const WRITE_ROLES = new Set(["owner", "admin", "affiliate_manager", "marketing_manager", "content_manager", "billing_manager", "agency_manager"]);

export async function membershipFor(authUserId: string, platformId?: string) {
  const db = adminDb();
  if (!db) return [];
  let q = db.from("partner_membership").select("*").eq("auth_user_id", authUserId).eq("status", "active");
  if (platformId) q = q.eq("platform_id", platformId);
  const { data } = await q;
  return data || [];
}

export function canWrite(role: string) {
  return WRITE_ROLES.has(role);
}

export type Membership = { platform_id: string; role: PartnerRole; agency_id?: string | null };
