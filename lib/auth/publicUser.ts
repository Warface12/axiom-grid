import { createClient } from "@/lib/supabase/admin";

export async function getAuthUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

export function oauthProviders() {
  return {
    google: process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true",
    apple: process.env.NEXT_PUBLIC_AUTH_APPLE === "true",
  };
}
