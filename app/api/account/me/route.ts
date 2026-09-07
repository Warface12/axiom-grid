import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/publicUser";
import { adminDb } from "@/lib/adminDb";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: true, user: null, items: [], follows: [], notifications: [], preferences: null });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: true, user: { email: user.email }, items: [], follows: [], notifications: [], preferences: null });
  const { data: profile } = await db.from("user_profile").select("*").eq("auth_user_id", user.id).maybeSingle();
  if (!profile) {
    return NextResponse.json({ ok: true, user: { email: user.email, id: user.id }, items: [], follows: [], notifications: [], preferences: null });
  }
  const [{ data: items }, { data: follows }, { data: notifications }, { data: preferences }] = await Promise.all([
    db.from("user_saved_item").select("*").eq("user_id", profile.id),
    db.from("user_follow").select("*").eq("user_id", profile.id),
    db.from("user_notification").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(40),
    db.from("notification_preference").select("*").eq("user_id", profile.id).maybeSingle(),
  ]);
  return NextResponse.json({ ok: true, user: { email: user.email, id: profile.id }, items: items || [], follows: follows || [], notifications: notifications || [], preferences: preferences || null });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user?.email) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const { data: profileRow } = await db.from("user_profile").upsert({
    auth_user_id: user.id,
    email: user.email,
    display_name: String(body.display_name || user.email.split("@")[0]),
  }, { onConflict: "auth_user_id" }).select("*").maybeSingle();
  if (body.preferences && profileRow) {
    await db.from("notification_preference").upsert({
      user_id: profileRow.id,
      ...body.preferences,
      marketing_opt_in: Boolean(body.preferences.marketing_opt_in),
    }, { onConflict: "user_id" });
  }
  return NextResponse.json({ ok: true });
}
