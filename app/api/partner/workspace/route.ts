import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/publicUser";
import { membershipFor, canWrite } from "@/lib/partner/access";
import { adminDb } from "@/lib/adminDb";
import { parsePublicHttpUrl } from "@/lib/httpUrl";
import {
  AD_PLACEMENTS,
  CAMPAIGN_TYPES,
  OFFER_TYPES,
  PARTNER_ROLES,
  REWARD_CLASSES,
  formatMetric,
  isMemberOf,
  trackedMetric,
} from "@/lib/ecosystem";

async function workspace(authUserId: string, platformId?: string) {
  const memberships = await membershipFor(authUserId, platformId);
  return memberships[0] || null;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false, error: "Partner sign-in required." }, { status: 401 });
  const requested = request.nextUrl.searchParams.get("platform_id") || undefined;
  const member = await workspace(user.id, requested);
  if (!member) {
    return NextResponse.json({
      ok: true,
      memberships: await membershipFor(user.id),
      workspace: null,
      message: "No company access yet. Apply for partner access or wait for an invitation. Consumer accounts cannot toggle into company admin.",
    });
  }
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: true, membership: member, workspace: null });
  const platformId = member.platform_id as string;
  const [
    { data: commercial },
    { data: platform },
    { data: offers },
    { data: campaigns },
    { data: invoices },
    { data: team },
    { data: conversions },
    { count: clicks },
    { data: inventory },
    { data: products },
  ] = await Promise.all([
    db.from("company_commercial").select("*").eq("platform_id", platformId).maybeSingle(),
    db.from("platform").select("id,name,slug,kind,official_url,visible").eq("id", platformId).maybeSingle(),
    db.from("offer").select("id,title,offer_type,reward_class,status,eligible_markets,created_at").eq("platform_id", platformId).order("created_at", { ascending: false }).limit(50),
    db.from("campaign").select("id,name,campaign_type,status,placements,geo_targets,destination_kind,destination_status,starts_at,ends_at").eq("platform_id", platformId).order("created_at", { ascending: false }).limit(50),
    db.from("invoice").select("id,status,kind,amount_minor,currency,created_at").eq("platform_id", platformId).order("created_at", { ascending: false }).limit(50),
    db.from("partner_membership").select("id,role,status,auth_user_id,created_at").eq("platform_id", platformId),
    db.from("conversion_event").select("id,status,environment,event_type").eq("platform_id", platformId),
    db.from("tracking_click").select("id", { count: "exact", head: true }).eq("platform_id", platformId),
    db.from("ad_inventory").select("placement,slot_limit,exclusive,status"),
    db.from("ad_product").select("id,code,name,pricing_model,amount_minor,currency,status"),
  ]);
  const tracking = commercial?.direct_tracking === "active";
  const live = (conversions || []).filter((row) => row.environment !== "test" && row.status === "accepted").length;
  return NextResponse.json({
    ok: true,
    membership: member,
    workspace: {
      platform,
      commercial: commercial || {
        company_relationship: "unclaimed",
        affiliate_relationship: "none",
        advertising_relationship: "none",
        direct_tracking: "not_connected",
      },
      offers: offers || [],
      campaigns: campaigns || [],
      invoices: invoices || [],
      team: team || [],
      inventory: inventory || [],
      adProducts: products || [],
      metrics: {
        clicks: formatMetric(trackedMetric(true, clicks || 0)),
        conversions: formatMetric(trackedMetric(tracking, tracking ? live : null)),
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false, error: "Partner sign-in required." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const member = await workspace(user.id, String(body.platform_id || "") || undefined);
  if (!member) return NextResponse.json({ ok: false, error: "No company access." }, { status: 403 });
  if (!canWrite(String(member.role))) return NextResponse.json({ ok: false, error: "Viewer accounts cannot submit commercial records." }, { status: 403 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
  const platformId = member.platform_id as string;
  const action = String(body.action || "");

  if (action === "create_offer") {
    const title = String(body.title || "").trim().slice(0, 140);
    if (!title) return NextResponse.json({ ok: false, error: "Offer title is required." }, { status: 400 });
    const offer_type = isMemberOf(OFFER_TYPES, String(body.offer_type || "other_reviewed")) ? body.offer_type : "other_reviewed";
    const reward_class = isMemberOf(REWARD_CLASSES, String(body.reward_class || "unknown")) ? body.reward_class : "unknown";
    let termsUrl: string | null = null;
    let sourceUrl: string | null = null;
    if (body.terms_url) {
      const terms = parsePublicHttpUrl(String(body.terms_url));
      if (!terms.ok) return NextResponse.json({ ok: false, error: terms.error }, { status: 400 });
      termsUrl = terms.url.toString();
    }
    if (body.official_source_url) {
      const source = parsePublicHttpUrl(String(body.official_source_url));
      if (!source.ok) return NextResponse.json({ ok: false, error: source.error }, { status: 400 });
      sourceUrl = source.url.toString();
    }
    const { error } = await db.from("offer").insert({
      platform_id: platformId,
      title,
      offer_type,
      reward_class,
      reward_value: String(body.reward_value || "").slice(0, 80) || null,
      eligibility: String(body.eligibility || "").slice(0, 400) || null,
      terms_url: termsUrl,
      official_source_url: sourceUrl,
      eligible_markets: Array.isArray(body.eligible_markets) ? body.eligible_markets.map(String).slice(0, 24) : [],
      status: "pending_review",
      verification_status: "needs_review",
      provenance: "partner_provided",
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "pending_review" });
  }

  if (action === "create_campaign") {
    const name = String(body.name || "").trim().slice(0, 140);
    if (!name) return NextResponse.json({ ok: false, error: "Campaign name is required." }, { status: 400 });
    const campaign_type = isMemberOf(CAMPAIGN_TYPES, String(body.campaign_type || "general_advertising")) ? body.campaign_type : "general_advertising";
    const placements = Array.isArray(body.placements)
      ? body.placements.map((item: string) => String(item)).filter((item: string) => isMemberOf(AD_PLACEMENTS, item)).slice(0, 8)
      : [];
    let destUrl: string | null = null;
    if (body.destination_url) {
      const parsed = parsePublicHttpUrl(String(body.destination_url));
      if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
      destUrl = parsed.url.toString();
    }
    const { error } = await db.from("campaign").insert({
      platform_id: platformId,
      name,
      campaign_type,
      placements,
      geo_targets: Array.isArray(body.geo_targets) ? body.geo_targets.map(String).slice(0, 24) : [],
      destination_url: destUrl,
      destination_kind: destUrl ? "partner_campaign" : "official",
      destination_status: destUrl ? "pending_review" : "official",
      creative_notes: String(body.creative_notes || "").slice(0, 2000) || null,
      status: "pending_review",
      disclosed: true,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "pending_review" });
  }

  if (action === "invite") {
    const email = String(body.email || "").trim().toLowerCase();
    const role = isMemberOf(PARTNER_ROLES, String(body.role || "viewer")) ? body.role : "viewer";
    if (!email.includes("@")) return NextResponse.json({ ok: false, error: "Invite a business email." }, { status: 400 });
    if (!["owner", "admin", "agency_manager"].includes(String(member.role))) {
      return NextResponse.json({ ok: false, error: "Only owners or admins can invite the team." }, { status: 403 });
    }
    await db.from("partner_invite").upsert({ platform_id: platformId, email, role, status: "pending" }, { onConflict: "platform_id,email" });
    const { data: profile } = await db.from("user_profile").select("auth_user_id").eq("email", email).maybeSingle();
    if (profile?.auth_user_id) {
      await db.from("partner_membership").upsert({
        auth_user_id: profile.auth_user_id,
        platform_id: platformId,
        role,
        status: "invited",
      }, { onConflict: "auth_user_id,platform_id" });
    }
    return NextResponse.json({ ok: true, invited: true, linkedExistingUser: Boolean(profile?.auth_user_id) });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
