import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/publicUser";
import { membershipFor } from "@/lib/partner/access";
import { adminDb } from "@/lib/adminDb";
import { trackedMetric, formatMetric } from "@/lib/ecosystem";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false, error: "Partner sign-in required." }, { status: 401 });
  const memberships = await membershipFor(user.id);
  if (!memberships.length) {
    return NextResponse.json({
      ok: true,
      memberships: [],
      overview: null,
      message: "No company access yet. Submit an application or wait for an invitation.",
    });
  }
  const db = adminDb();
  const platformId = memberships[0].platform_id as string;
  if (!db) return NextResponse.json({ ok: true, memberships, overview: null });
  const [{ data: commercial }, { count: clicks }, { data: conversions }, { data: campaigns }, { data: invoices }] = await Promise.all([
    db.from("company_commercial").select("*").eq("platform_id", platformId).maybeSingle(),
    db.from("tracking_click").select("id", { count: "exact", head: true }).eq("platform_id", platformId),
    db.from("conversion_event").select("id,status,environment").eq("platform_id", platformId).neq("environment", "test"),
    db.from("campaign").select("id,status,name").eq("platform_id", platformId),
    db.from("invoice").select("id,status,kind,amount_minor,currency").eq("platform_id", platformId),
  ]);
  const tracking = commercial?.direct_tracking === "active";
  const liveConversions = (conversions || []).filter((row) => row.status === "accepted").length;
  return NextResponse.json({
    ok: true,
    memberships,
    overview: {
      companyRelationship: commercial?.company_relationship || "unclaimed",
      affiliateRelationship: commercial?.affiliate_relationship || "none",
      advertisingRelationship: commercial?.advertising_relationship || "none",
      directTracking: commercial?.direct_tracking || "not_connected",
      campaigns: campaigns || [],
      clicks: formatMetric(trackedMetric(true, clicks || 0)),
      registrations: formatMetric(trackedMetric(tracking, tracking ? liveConversions : null)),
      invoices: invoices || [],
    },
  });
}
