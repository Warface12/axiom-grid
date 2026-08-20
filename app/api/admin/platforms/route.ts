import { isAdminUser } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const cleanArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean)
    : String(value ?? "").split(",").map((v) => v.trim()).filter(Boolean);

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok:false, error:"Unauthorized", items:[] }, { status:401 });
  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error: "Supabase admin connection is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
      items: [],
    });
  }
  const { data, error } = await supabase.from("platform").select("*").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, configured: true, error: error.message, items: [] }, { status: 500 });
  return NextResponse.json({ ok: true, configured: true, items: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase admin connection is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const kind = String(body.kind ?? "").trim();
  const slug = String(body.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
  if (!name || !slug || !["exchange", "broker", "wallet"].includes(kind)) {
    return NextResponse.json({ ok: false, error: "Name, slug and a valid platform type are required." }, { status: 400 });
  }

  const payload = {
    slug,
    name,
    kind,
    short_description: String(body.short_description ?? "").trim() || null,
    full_review: String(body.full_review ?? "").trim() || null,
    official_url: String(body.official_url ?? "").trim() || null,
    affiliate_url: String(body.affiliate_url ?? "").trim() || null,
    affiliate_partner_id: String(body.affiliate_partner_id ?? "").trim() || null,
    logo_url: String(body.logo_url ?? "").trim() || null,
    status: ["research", "verified", "restricted"].includes(String(body.status)) ? String(body.status) : "research",
    custody_model: String(body.custody_model ?? "").trim() || null,
    tags: cleanArray(body.tags),
    fee_summary: String(body.fee_summary ?? "").trim() || null,
    security_summary: String(body.security_summary ?? "").trim() || null,
    regulatory_summary: String(body.regulatory_summary ?? "").trim() || null,
    product_summary: String(body.product_summary ?? "").trim() || null,
    pros: cleanArray(body.pros),
    cons: cleanArray(body.cons),
    seo_title: String(body.seo_title ?? "").trim() || null,
    seo_description: String(body.seo_description ?? "").trim() || null,
    featured: Boolean(body.featured),
    visible: Boolean(body.visible),
    updated_at: new Date().toISOString(),
  };

  const id = String(body.id ?? "").trim();
  const query = id
    ? supabase.from("platform").update(payload).eq("id", id).select("*").single()
    : supabase.from("platform").insert(payload).select("*").single();
  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase admin connection is not configured." }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Platform id is required." }, { status: 400 });
  const { error } = await supabase.from("platform").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
