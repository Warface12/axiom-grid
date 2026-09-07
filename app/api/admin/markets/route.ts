import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/supabase/admin";
import { parsePublicHttpUrl } from "@/lib/httpUrl";

function db() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!u || !k) return null;
  return createClient(u, k, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const s = db();
  if (!s) return NextResponse.json({ ok: false, error: "Supabase is not configured", items: [], platforms: [] }, { status: 503 });
  const [{ data: items, error }, { data: platforms }] = await Promise.all([
    s.from("platform_market").select("*,platform:platform_id(id,name,kind)").order("updated_at", { ascending: false }),
    s.from("platform").select("id,name,kind,status,visible").order("name"),
  ]);
  if (error) return NextResponse.json({ ok: false, error: error.message, items: [], platforms: platforms || [] }, { status: 500 });
  return NextResponse.json({ ok: true, items: items || [], platforms: platforms || [] });
}

export async function POST(r: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const s = db();
  if (!s) return NextResponse.json({ ok: false, error: "Supabase is not configured" }, { status: 503 });
  const b = await r.json().catch(() => ({}));
  if (!b.platform_id || !b.market_code) return NextResponse.json({ ok: false, error: "Platform and market are required" }, { status: 400 });
  const affiliateRaw = String(b.affiliate_url || "").trim();
  if (affiliateRaw) {
    const parsed = parsePublicHttpUrl(affiliateRaw);
    if (!parsed.ok) return NextResponse.json({ ok: false, error: `Market affiliate URL: ${parsed.error}` }, { status: 400 });
  }
  const payload = {
    platform_id: String(b.platform_id),
    market_code: String(b.market_code).toUpperCase(),
    region_code: String(b.region_code || "").trim() || null,
    product_available: Boolean(b.product_available),
    commercial_allowed: Boolean(b.commercial_allowed),
    status: ["review", "approved", "restricted"].includes(String(b.status)) ? String(b.status) : "review",
    evidence_url: String(b.evidence_url || "").trim() || null,
    notes: String(b.notes || "").trim() || null,
    reviewed_at: b.reviewed_at || null,
    expires_at: b.expires_at || null,
    affiliate_url: affiliateRaw || null,
    campaign_subid: String(b.campaign_subid || "").trim() || null,
    legal_notice: String(b.legal_notice || "").trim() || null,
    updated_at: new Date().toISOString(),
  };
  if (payload.status !== "approved") payload.commercial_allowed = false;
  const run = (row: typeof payload) =>
    b.id ? s.from("platform_market").update(row).eq("id", b.id).select("*").single() : s.from("platform_market").insert(row).select("*").single();
  let { data, error } = await run(payload);
  if (error && /column|schema cache/i.test(error.message)) {
    const { affiliate_url, campaign_subid, legal_notice, ...legacy } = payload;
    ({ data, error } = await run(legacy as typeof payload));
  }
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(r: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const s = db();
  const id = r.nextUrl.searchParams.get("id");
  if (!s || !id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await s.from("platform_market").delete().eq("id", id);
  return error ? NextResponse.json({ ok: false, error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
