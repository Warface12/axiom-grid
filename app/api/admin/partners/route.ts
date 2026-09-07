import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb } from "@/lib/adminDb";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  const [{ data: applications }, { data: commercial }, { data: campaigns }, { data: offers }] = await Promise.all([
    db.from("partner_application").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("company_commercial").select("*"),
    db.from("campaign").select("id,status,platform_id"),
    db.from("offer").select("id,status,platform_id"),
  ]);
  return NextResponse.json({
    ok: true,
    applications: applications || [],
    commercial: commercial || [],
    campaigns: campaigns || [],
    offers: offers || [],
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const status = String(body.status || "");
  if (!id || !["approved", "rejected", "in_review"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Provide application id and status." }, { status: 400 });
  }
  const { error } = await db.from("partner_application").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (status === "approved" && body.platform_id) {
    await db.from("company_commercial").upsert({
      platform_id: body.platform_id,
      company_relationship: "verified",
    }, { onConflict: "platform_id" });
    if (body.claim_id) await db.from("company_claim").update({ status: "approved" }).eq("id", body.claim_id);
  }
  await writeAudit({ actor: "admin", action: "partner_application_reviewed", entity: "partner_application", entityId: id, meta: { status } });
  return NextResponse.json({ ok: true });
}
