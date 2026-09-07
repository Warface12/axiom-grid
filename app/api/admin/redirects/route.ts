import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb } from "@/lib/adminDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanPath(value: string) {
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://") || path.includes("\\")) return null;
  if (path.length > 180) return null;
  return path;
}

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Admin database is not configured." }, { status: 503 });
  const { data, error } = await db.from("seo_redirect").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message, items: [] }, { status: 500 });
  return NextResponse.json({ ok: true, items: data || [] });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Admin database is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const from_path = cleanPath(String(body.from_path || ""));
  const to_path = cleanPath(String(body.to_path || ""));
  if (!from_path || !to_path) return NextResponse.json({ ok: false, error: "Use site-relative paths such as /old-page." }, { status: 400 });
  if (from_path === to_path) return NextResponse.json({ ok: false, error: "From and to cannot match." }, { status: 400 });
  const { error } = await db.from("seo_redirect").upsert({
    from_path,
    to_path,
    permanent: body.permanent !== false,
  }, { onConflict: "from_path" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Admin database is not configured." }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const { error } = await db.from("seo_redirect").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
