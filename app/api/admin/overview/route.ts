import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb } from "@/lib/adminDb";

export async function GET() {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, configured: false, error: "Supabase is not configured." }, { status: 503 });
  const [{ data: platforms }, { data: markets }, { count: clicks }] = await Promise.all([
    db.from("platform").select("id,name,kind,status,visible,featured,seo_title,seo_description,affiliate_url,updated_at"),
    db.from("platform_market").select("id,status,commercial_allowed,product_available,expires_at"),
    db.from("affiliate_click").select("id", { count: "exact", head: true }),
  ]);
  const items = platforms || [];
  const rules = markets || [];
  const now = Date.now();
  const missingSeo = items.filter((p) => !p.seo_title || !p.seo_description).length;
  const missingAffiliate = items.filter((p) => p.visible && !p.affiliate_url).length;
  const expired = rules.filter((r) => r.expires_at && new Date(r.expires_at).getTime() < now).length;
  return NextResponse.json({
    ok: true,
    configured: true,
    kpis: {
      platforms: items.length,
      visible: items.filter((p) => p.visible).length,
      drafts: items.filter((p) => !p.visible).length,
      featured: items.filter((p) => p.featured).length,
      exchanges: items.filter((p) => p.kind === "exchange").length,
      brokers: items.filter((p) => p.kind === "broker").length,
      wallets: items.filter((p) => p.kind === "wallet").length,
      marketRules: rules.length,
      commercialOpen: rules.filter((r) => r.commercial_allowed && r.status === "approved").length,
      expiredRules: expired,
      missingSeo,
      missingAffiliate,
      clicks: clicks || 0,
    },
    recent: items.slice(0, 6),
  });
}
