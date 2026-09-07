import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb } from "@/lib/adminDb";
import { parsePublicHttpUrl } from "@/lib/httpUrl";

export async function GET(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const db = adminDb();
  const platformId = request.nextUrl.searchParams.get("platform_id");
  if (!db || !platformId) return NextResponse.json({ ok: false, items: [] }, { status: 400 });
  const { data, error } = await db.from("evidence_source").select("*").eq("platform_id", platformId).order("observed_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message, items: [] }, { status: 500 });
  return NextResponse.json({ ok: true, items: data || [] });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const platformId = String(body.platform_id || "").trim();
  const parsed = parsePublicHttpUrl(String(body.url || ""));
  if (!platformId || !parsed.ok) return NextResponse.json({ ok: false, error: parsed.ok ? "Platform is required." : parsed.error }, { status: 400 });
  const payload = {
    platform_id: platformId,
    url: parsed.url.toString(),
    title: String(body.title || "").trim() || null,
    source_type: String(body.source_type || "official").trim() || "official",
    claim_scope: String(body.claim_scope || "").trim() || null,
    observed_at: body.observed_at || new Date().toISOString(),
    active: body.active !== false,
  };
  const { data, error } = await db.from("evidence_source").insert(payload).select("*").single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const db = adminDb();
  const id = request.nextUrl.searchParams.get("id");
  if (!db || !id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await db.from("evidence_source").delete().eq("id", id);
  return error ? NextResponse.json({ ok: false, error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
