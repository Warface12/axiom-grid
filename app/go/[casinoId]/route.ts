import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { marketFromGeo } from "@/lib/nivaro-core/markets";

export async function GET(request: NextRequest, { params }: { params: Promise<{ casinoId: string }> }) {
  const { casinoId } = await params;
  const bonusId = request.nextUrl.searchParams.get("bonusId") || request.nextUrl.searchParams.get("offer");
  const promoId = request.nextUrl.searchParams.get("promo");
  const source = request.nextUrl.searchParams.get("source") || "/";
  const country = (request.headers.get("x-nivaro-country") || request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const region = (request.headers.get("x-nivaro-region") || request.headers.get("x-vercel-ip-country-region") || "").toUpperCase();
  const market = marketFromGeo(country, region);

  const auth = await createSupabaseServerClient();
  const { data: { user } } = await auth.auth.getUser();
  const owner = Boolean(user?.email && process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
  if (!market && !owner) return NextResponse.redirect(new URL("/casinos", request.url));

  const supabase = await createSupabaseServiceClient();
  if (!supabase) return NextResponse.redirect(new URL("/", request.url));

  let casinoQuery = supabase.from("casino").select("affiliate_url,affiliate_partner_id,active,visible").eq("id", casinoId).eq("active", true).eq("visible", true);
  const { data: casino } = await casinoQuery.maybeSingle();
  if (!casino?.affiliate_url) return NextResponse.redirect(new URL("/casinos", request.url));

  if (!owner) {
    const { data: compliance } = await supabase
      .from("casino_market_compliance")
      .select("status,listing_allowed,affiliate_cta_allowed")
      .eq("casino_id", casinoId)
      .eq("market_code", market!)
      .maybeSingle();
    if (!compliance || compliance.status !== "approved" || !compliance.listing_allowed || !compliance.affiliate_cta_allowed) {
      return NextResponse.redirect(new URL("/casinos", request.url));
    }
  }

  let trackingUrl = casino.affiliate_url;
  if (bonusId) {
    const { data: bonus } = await supabase.from("bonus").select("affiliate_tracking_url,active,status").eq("id", bonusId).eq("casino_id", casinoId).maybeSingle();
    let allowed = owner;
    if (!owner && market && bonus?.active && bonus.status === "active") {
      const { data: bc } = await supabase.from("bonus_market_compliance").select("status,public_promotion_allowed,affiliate_cta_allowed").eq("bonus_id", bonusId).eq("market_code", market).maybeSingle();
      allowed = bc?.status === "approved" && bc.public_promotion_allowed === true && bc.affiliate_cta_allowed === true;
    }
    if (allowed && bonus?.affiliate_tracking_url) trackingUrl = bonus.affiliate_tracking_url;
  }

  if (promoId) {
    const { data: promo } = await supabase.from("promo_code").select("affiliate_tracking_url,active,status").eq("id", promoId).eq("casino_id", casinoId).maybeSingle();
    let allowed = owner;
    if (!owner && market && promo?.active && promo.status === "active") {
      const { data: pc } = await supabase.from("promo_code_market_compliance").select("status,public_promotion_allowed,affiliate_cta_allowed").eq("promo_code_id", promoId).eq("market_code", market).maybeSingle();
      allowed = pc?.status === "approved" && pc.public_promotion_allowed === true && pc.affiliate_cta_allowed === true;
    }
    if (allowed && promo?.affiliate_tracking_url) trackingUrl = promo.affiliate_tracking_url;
  }

  try {
    await supabase.from("affiliate_click").insert({
      casino_id: casinoId,
      bonus_id: bonusId,
      partner_id: casino.affiliate_partner_id,
      source_page: source,
      visitor_id: request.cookies.get("nivaro_vid")?.value || null,
      user_agent: request.headers.get("user-agent"),
    });
  } catch {}

  return NextResponse.redirect(trackingUrl);
}
