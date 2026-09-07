import { NextRequest, NextResponse } from "next/server";
import { adminDb, hostnameOf } from "@/lib/adminDb";
import { parsePublicHttpUrl } from "@/lib/httpUrl";
import { APPLICATION_ROLES, PARTNER_INTENT, isMemberOf } from "@/lib/ecosystem";
import { scorePartnerApplication } from "@/lib/partnerVerification";
import { sendEmail } from "@/lib/email/provider";
import { writeAudit } from "@/lib/audit";

const attempts = new Map<string, { count: number; reset: number }>();

function limited(ip: string) {
  const now = Date.now();
  const row = attempts.get(ip);
  if (!row || row.reset < now) {
    attempts.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  row.count += 1;
  return row.count > 12;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many applications. Try later." }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const company_name = String(body.company_name || "").trim().slice(0, 120);
  const official_website = String(body.official_website || "").trim();
  const representative_name = String(body.representative_name || "").trim().slice(0, 80);
  const business_email = String(body.business_email || "").trim().toLowerCase();
  const representative_role = String(body.representative_role || "");
  const intent = String(body.intent || "");
  if (!company_name || !representative_name || !business_email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Company name, representative name and a business email are required." }, { status: 400 });
  }
  const url = parsePublicHttpUrl(official_website);
  if (!url.ok) return NextResponse.json({ ok: false, error: url.error }, { status: 400 });
  if (!isMemberOf(APPLICATION_ROLES, representative_role) || !isMemberOf(PARTNER_INTENT, intent)) {
    return NextResponse.json({ ok: false, error: "Choose a valid role and partnership intent." }, { status: 400 });
  }
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Applications are not available until the database is configured." }, { status: 503 });

  const host = hostnameOf(url.url.toString());
  const { data: platforms } = await db.from("platform").select("id,name,official_url,slug");
  const existing = (platforms || []).find((row) => hostnameOf(row.official_url) === host) || null;
  const scored = scorePartnerApplication({ website: url.url.toString(), email: business_email, existingPlatform: Boolean(existing) });

  const { data, error } = await db.from("partner_application").insert({
    company_name,
    official_website: url.url.origin,
    representative_name,
    business_email,
    representative_role,
    intent,
    existing_platform_id: existing?.id || null,
    verification_score: scored.score,
    verification_status: scored.status,
    verification_notes: scored.reasons,
    status: "email_pending",
  }).select("id").maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  if (existing) {
    await db.from("company_claim").insert({ platform_id: existing.id, application_id: data?.id, status: "pending" });
    await db.from("company_commercial").upsert({
      platform_id: existing.id,
      company_relationship: "claim_pending",
    }, { onConflict: "platform_id" });
  }

  await db.from("email_outbox").insert({
    to_email: business_email,
    subject: "TopPick partner application received",
    body: "We received your application for partner access. A reviewer will continue after email verification is available.",
    category: "transactional",
    status: "queued",
  });
  const mailed = await sendEmail({
    to: business_email,
    subject: "TopPick partner application received",
    text: "We received your application. This is not yet verified partner access. You will hear from TopPick after review.",
    category: "transactional",
  });
  await writeAudit({ actor: business_email, action: "partner_application_submitted", entity: "partner_application", entityId: data?.id, meta: { existing: existing?.id || null, mailed: mailed.ok } });

  return NextResponse.json({
    ok: true,
    applicationId: data?.id,
    claimSuggested: Boolean(existing),
    existingName: existing?.name || null,
    verification: scored,
    email: mailed.skipped
      ? { status: "queued_not_sent", ownerAction: mailed.error }
      : { status: mailed.ok ? "sent" : "failed", error: mailed.error || null },
    next: "Email verification and TopPick review. DNS verification is not required for every applicant.",
  });
}
