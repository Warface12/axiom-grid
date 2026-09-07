import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";
import { verifyPostback } from "@/lib/trackingCrypto";
import { writeAudit } from "@/lib/audit";
import { CONVERSION_EVENTS, isMemberOf } from "@/lib/ecosystem";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  const platformId = request.nextUrl.searchParams.get("platform") || request.headers.get("x-toppick-platform") || "";
  const timestamp = request.headers.get("x-toppick-timestamp") || "";
  const signature = request.headers.get("x-toppick-signature") || "";
  const eventId = request.headers.get("x-toppick-event-id") || "";
  const raw = await request.text();
  const { data: endpoint } = await db.from("integration_endpoint").select("*").eq("platform_id", platformId).eq("kind", "s2s_postback").maybeSingle();
  if (!endpoint?.secret_hash) return NextResponse.json({ ok: false, error: "Tracking is not connected for this company." }, { status: 404 });
  const secret = process.env.CONVERSION_WEBHOOK_PEPPER || "";
  if (!secret) return NextResponse.json({ ok: false, error: "OWNER ACTION REQUIRED: CONVERSION_WEBHOOK_PEPPER" }, { status: 503 });
  const check = verifyPostback({ secret: `${secret}:${endpoint.secret_hash}`, timestamp, eventId, body: raw, signature });
  if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 401 });
  const payload = raw ? JSON.parse(raw) as { event_type?: string; click_id?: string; environment?: string } : {};
  const eventType = String(payload.event_type || "");
  if (!isMemberOf(CONVERSION_EVENTS, eventType)) return NextResponse.json({ ok: false, error: "Unknown event type." }, { status: 400 });
  const environment = payload.environment === "test" ? "test" : "live";
  const { error } = await db.from("conversion_event").insert({
    platform_id: platformId,
    click_id: payload.click_id || null,
    event_id: eventId,
    event_type: eventType,
    status: environment === "test" ? "test" : "pending",
    environment,
    payload,
  });
  if (error && /duplicate|unique/i.test(error.message)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  await writeAudit({ actor: platformId, action: "conversion_received", entity: "conversion_event", entityId: eventId, meta: { eventType, environment } });
  return NextResponse.json({ ok: true });
}
