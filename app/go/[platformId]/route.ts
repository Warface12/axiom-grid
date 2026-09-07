import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { partnerPromotionDecision } from "@/lib/compliance";
import { parsePublicHttpUrl } from "@/lib/httpUrl";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function marketFrom(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("market") || "").toUpperCase();
  const cookie = (request.cookies.get("toppick_market")?.value || "").toUpperCase();
  const geo = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  return query || cookie || geo || null;
}

function withCampaign(url: string, campaign?: string | null, subid?: string | null) {
  if (!campaign && !subid) return url;
  try {
    const parsed = new URL(url);
    if (campaign && !parsed.searchParams.get("subid") && !parsed.searchParams.get("s1")) parsed.searchParams.set("subid", campaign);
    if (subid && !parsed.searchParams.get("clickid")) parsed.searchParams.set("clickid", subid);
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ platformId: string }> }) {
  const { platformId } = await params;
  const supabase = db();
  if (!supabase) return NextResponse.redirect(new URL("/unavailable?reason=configuration", request.url));
  const market = marketFrom(request);
  const decision = await partnerPromotionDecision(platformId, market);
  if (!decision.allowed) {
    return NextResponse.redirect(new URL(`/unavailable?reason=market&market=${encodeURIComponent(decision.marketCode || "")}`, request.url));
  }
  const { data } = await supabase
    .from("platform")
    .select("*")
    .eq("id", platformId)
    .maybeSingle();
  if (!data || !data.visible || data.status === "restricted") {
    return NextResponse.redirect(new URL("/unavailable?reason=link", request.url));
  }
  let destination = data.affiliate_url as string | null;
  let geoSubid: string | null = null;
  if (decision.marketCode) {
    const { data: geoRows } = await supabase
      .from("platform_market")
      .select("*")
      .eq("platform_id", platformId)
      .eq("market_code", decision.marketCode);
    const region = (request.headers.get("x-vercel-ip-country-region") || "").toUpperCase();
    const geoRow = (geoRows || []).find((row) => String(row.region_code || "").toUpperCase() === region) || (geoRows || []).find((row) => !row.region_code) || geoRows?.[0];
    if (geoRow?.affiliate_url) destination = geoRow.affiliate_url;
    geoSubid = geoRow?.campaign_subid || null;
  }
  if (destination) destination = withCampaign(destination, data.affiliate_campaign, geoSubid);
  const safe = destination ? parsePublicHttpUrl(destination) : { ok: false as const };
  if (!safe.ok) return NextResponse.redirect(new URL("/unavailable?reason=link", request.url));
  const clickId = crypto.randomUUID().replace(/-/g, "");
  const click = {
    platform_id: platformId,
    market_code: decision.marketCode,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
    placement: request.nextUrl.searchParams.get("placement") || request.nextUrl.searchParams.get("src") || null,
    cta: request.nextUrl.searchParams.get("cta") || null,
    click_id: clickId,
  };
  const { error: clickError } = await supabase.from("affiliate_click").insert(click);
  if (clickError && /column|schema cache/i.test(clickError.message)) {
    const { placement, cta, click_id, ...legacy } = click;
    await supabase.from("affiliate_click").insert(legacy);
  }
  const { error: trackError } = await supabase.from("tracking_click").insert({
    click_id: clickId,
    platform_id: platformId,
    placement: click.placement,
    market_code: decision.marketCode,
    source_path: request.headers.get("referer"),
    destination_kind: "toppick_affiliate",
  });
  void trackError;
  const dest = new URL(safe.url.toString());
  if (!dest.searchParams.get("clickid")) dest.searchParams.set("clickid", clickId);
  return NextResponse.redirect(dest.toString(), 302);
}
