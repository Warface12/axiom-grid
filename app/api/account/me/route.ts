import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/publicUser";
import { adminDb } from "@/lib/adminDb";
import { ensureUserProfile } from "@/lib/accountDesk";
import { sanitizeInterests } from "@/lib/interests";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: true, user: null, items: [], follows: [], notifications: [], preferences: null, interests: [] });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: true, user: { email: user.email }, items: [], follows: [], notifications: [], preferences: null, interests: [] });
  const profile = await ensureUserProfile(db, user);
  if (!profile) {
    return NextResponse.json({ ok: true, user: { email: user.email, id: user.id }, items: [], follows: [], notifications: [], preferences: null, interests: [] });
  }
  const [{ data: items }, { data: follows }, { data: notifications }, { data: preferences }] = await Promise.all([
    db.from("user_saved_item").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
    db.from("user_follow").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
    db.from("user_notification").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(40),
    db.from("notification_preference").select("*").eq("user_id", profile.id).maybeSingle(),
  ]);
  return NextResponse.json({
    ok: true,
    user: { email: user.email, id: profile.id },
    items: items || [],
    follows: follows || [],
    notifications: notifications || [],
    preferences: preferences || null,
    interests: profile.interests || [],
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user?.email) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const profile = await ensureUserProfile(db, user);
  if (!profile) return NextResponse.json({ ok: false, error: "Could not create profile." }, { status: 500 });

  if (body.display_name) {
    await db.from("user_profile").update({ display_name: String(body.display_name).slice(0, 80), updated_at: new Date().toISOString() }).eq("id", profile.id);
  }

  if (Array.isArray(body.interests)) {
    await db.from("user_profile").update({ interests: sanitizeInterests(body.interests), updated_at: new Date().toISOString() }).eq("id", profile.id);
  }

  if (body.preferences) {
    await db.from("notification_preference").upsert({
      user_id: profile.id,
      offers: Boolean(body.preferences.offers),
      rewards: Boolean(body.preferences.rewards),
      learn: Boolean(body.preferences.learn),
      games: Boolean(body.preferences.games),
      products: Boolean(body.preferences.products),
      events: Boolean(body.preferences.events),
      research: Boolean(body.preferences.research),
      followed: Boolean(body.preferences.followed),
      digest: ["important", "daily", "weekly"].includes(String(body.preferences.digest)) ? body.preferences.digest : "weekly",
      marketing_opt_in: Boolean(body.preferences.marketing_opt_in),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }

  if (body.save) {
    const item_type = String(body.save.item_type || "").slice(0, 40);
    const item_id = String(body.save.item_id || "").slice(0, 120);
    if (item_type && item_id) {
      await db.from("user_saved_item").upsert({ user_id: profile.id, item_type, item_id }, { onConflict: "user_id,item_type,item_id" });
    }
  }
  if (body.unsave) {
    await db.from("user_saved_item").delete().eq("user_id", profile.id).eq("item_type", String(body.unsave.item_type)).eq("item_id", String(body.unsave.item_id));
  }
  if (body.follow?.platform_id) {
    await db.from("user_follow").upsert({ user_id: profile.id, platform_id: body.follow.platform_id }, { onConflict: "user_id,platform_id" });
  }
  if (body.unfollow?.platform_id) {
    await db.from("user_follow").delete().eq("user_id", profile.id).eq("platform_id", body.unfollow.platform_id);
  }
  if (body.mark_read === "all") {
    await db.from("user_notification").update({ read_at: new Date().toISOString() }).eq("user_id", profile.id).is("read_at", null);
  } else if (body.mark_read?.id) {
    await db.from("user_notification").update({ read_at: new Date().toISOString() }).eq("user_id", profile.id).eq("id", body.mark_read.id);
  }

  return NextResponse.json({ ok: true });
}
