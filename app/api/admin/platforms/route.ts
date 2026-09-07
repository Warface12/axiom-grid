import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { parsePublicHttpUrl } from "@/lib/httpUrl";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const cleanArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean)
    : String(value ?? "").split(/[\n,]/).map((v) => v.trim()).filter(Boolean);

function optionalUrl(value: unknown, label: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return { ok: true as const, value: null };
  const parsed = parsePublicHttpUrl(raw);
  if (!parsed.ok) return { ok: false as const, error: `${label}: ${parsed.error}` };
  return { ok: true as const, value: parsed.url.toString() };
}

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized", items: [] }, { status: 401 });
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
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase admin connection is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const kind = String(body.kind ?? "").trim();
  const slug = String(body.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
  if (!name || !slug || !["exchange", "broker", "wallet"].includes(kind)) {
    return NextResponse.json({ ok: false, error: "Name, slug and a valid platform type are required." }, { status: 400 });
  }

  const official = optionalUrl(body.official_url, "Official URL");
  const affiliate = optionalUrl(body.affiliate_url, "Affiliate URL");
  const logo = optionalUrl(body.logo_url, "Logo URL");
  const og = optionalUrl(body.og_image_url, "OG image URL");
  for (const check of [official, affiliate, logo, og]) {
    if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
  }

  const payload = {
    slug,
    name,
    kind,
    short_description: String(body.short_description ?? "").trim() || null,
    full_review: String(body.full_review ?? "").trim() || null,
    official_url: official.value,
    affiliate_url: affiliate.value,
    affiliate_partner_id: String(body.affiliate_partner_id ?? "").trim() || null,
    affiliate_campaign: String(body.affiliate_campaign ?? "").trim() || null,
    logo_url: logo.value,
    og_image_url: og.value,
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
    ranking_priority: Number.isFinite(Number(body.ranking_priority)) ? Number(body.ranking_priority) : 0,
    import_source_url: String(body.import_source_url ?? "").trim() || null,
    import_retrieved_at: body.import_retrieved_at || null,
    import_provenance: body.import_provenance && typeof body.import_provenance === "object" ? body.import_provenance : {},
    updated_at: new Date().toISOString(),
  };

  const id = String(body.id ?? "").trim();
  const run = (row: typeof payload) =>
    id
      ? supabase.from("platform").update(row).eq("id", id).select("*").single()
      : supabase.from("platform").insert(row).select("*").single();
  let { data, error } = await run(payload);
  if (error && /column|schema cache/i.test(error.message)) {
    const { ranking_priority, affiliate_campaign, og_image_url, import_source_url, import_retrieved_at, import_provenance, ...legacy } = payload;
    ({ data, error } = await run(legacy as typeof payload));
  }
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase admin connection is not configured." }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Platform id is required." }, { status: 400 });
  const { error } = await supabase.from("platform").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
