import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb } from "@/lib/adminDb";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  const [{ data: applications }, { data: commercial }, { data: campaigns }, { data: offers }, { data: claims }, { data: leads }] = await Promise.all([
    db.from("partner_application").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("company_commercial").select("*"),
    db.from("campaign").select("id,status,platform_id,name").order("created_at", { ascending: false }).limit(80),
    db.from("offer").select("id,status,platform_id,title").order("created_at", { ascending: false }).limit(80),
    db.from("company_claim").select("*").order("created_at", { ascending: false }).limit(80),
    db.from("partner_lead").select("id,status").limit(200),
  ]);
  return NextResponse.json({
    ok: true,
    applications: applications || [],
    commercial: commercial || [],
    campaigns: campaigns || [],
    offers: offers || [],
    claims: claims || [],
    leads: leads || [],
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "application");
  if (action === "review_offer" && body.id) {
    const next = String(body.status || "");
    if (!["active", "rejected", "paused"].includes(next)) return NextResponse.json({ ok: false, error: "Invalid offer status." }, { status: 400 });
    const { error } = await db.from("offer").update({ status: next, verification_status: next === "active" ? "manual" : "needs_review" }).eq("id", body.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await writeAudit({ actor: "admin", action: "offer_reviewed", entity: "offer", entityId: String(body.id), meta: { status: next } });
    return NextResponse.json({ ok: true });
  }
  if (action === "review_campaign" && body.id) {
    const next = String(body.status || "");
    if (!["active", "rejected", "paused", "scheduled"].includes(next)) return NextResponse.json({ ok: false, error: "Invalid campaign status." }, { status: 400 });
    const { error } = await db.from("campaign").update({ status: next }).eq("id", body.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await writeAudit({ actor: "admin", action: "campaign_reviewed", entity: "campaign", entityId: String(body.id), meta: { status: next } });
    return NextResponse.json({ ok: true });
  }
  if (action === "approve_destination" && body.id) {
    const { error } = await db.from("campaign").update({ destination_status: "approved" }).eq("id", body.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await writeAudit({ actor: "admin", action: "campaign_destination_approved", entity: "campaign", entityId: String(body.id) });
    return NextResponse.json({ ok: true });
  }
  const id = String(body.id || "");
  const status = String(body.status || "");
  if (!id || !["approved", "rejected", "in_review"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Provide application id and status." }, { status: 400 });
  }
  const { data: application, error: loadError } = await db.from("partner_application").select("*").eq("id", id).maybeSingle();
  if (loadError || !application) return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 });
  const { error } = await db.from("partner_application").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const platformId = String(body.platform_id || application.existing_platform_id || "");
  if (status === "approved" && platformId) {
    await db.from("company_commercial").upsert({
      platform_id: platformId,
      company_relationship: "verified",
    }, { onConflict: "platform_id" });
    if (body.claim_id || application.existing_platform_id) {
      await db.from("company_claim").update({ status: "approved" }).eq("application_id", id);
    }
    const { data: profile } = await db.from("user_profile").select("auth_user_id").eq("email", application.business_email).maybeSingle();
    if (profile?.auth_user_id) {
      await db.from("partner_membership").upsert({
        auth_user_id: profile.auth_user_id,
        platform_id: platformId,
        role: "owner",
        status: "active",
      }, { onConflict: "auth_user_id,platform_id" });
    }
  }
  await writeAudit({ actor: "admin", action: "partner_application_reviewed", entity: "partner_application", entityId: id, meta: { status, platformId: platformId || null } });
  return NextResponse.json({ ok: true, membershipCreated: Boolean(status === "approved" && platformId) });
}
