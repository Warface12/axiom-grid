import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureUserProfile(
  db: SupabaseClient,
  user: { id: string; email?: string | null },
) {
  if (!user.email) return null;
  const { data: existing } = await db.from("user_profile").select("*").eq("auth_user_id", user.id).maybeSingle();
  if (existing) return existing;
  const { data } = await db.from("user_profile").upsert({
    auth_user_id: user.id,
    email: user.email,
    display_name: user.email.split("@")[0],
  }, { onConflict: "auth_user_id" }).select("*").maybeSingle();
  if (data) {
    await db.from("notification_preference").upsert({ user_id: data.id }, { onConflict: "user_id" });
    await db.from("user_notification").insert({
      user_id: data.id,
      kind: "transactional",
      title: "Welcome to TopPick",
      body: "Your account is ready. Follow companies and save research when published profiles exist. Promotional email stays off until you opt in.",
      href: "/account",
    });
  }
  return data;
}
