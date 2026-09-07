import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb } from "@/lib/adminDb";
import { computeAdminKpis } from "@/lib/adminKpis";

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, configured: false, error: "Supabase is not configured." }, { status: 503 });
  const [{ data: platforms }, { data: markets }, { count: clicks }] = await Promise.all([
    db.from("platform").select("*"),
    db.from("platform_market").select("id,status,commercial_allowed,product_available,expires_at"),
    db.from("affiliate_click").select("id", { count: "exact", head: true }),
  ]);
  const items = platforms || [];
  return NextResponse.json({
    ok: true,
    configured: true,
    kpis: computeAdminKpis(items, markets || [], clicks || 0),
    recent: items.slice(0, 6),
  });
}
