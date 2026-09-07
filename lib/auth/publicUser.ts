import { createClient } from "@/lib/supabase/admin";
import { hasAdminSession } from "@/lib/admin-auth";

export function isPublicAuthConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  return /^https?:\/\//i.test(url) && key.length > 10;
}

export async function getAuthUser() {
  if (!isPublicAuthConfigured()) return null;
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

export async function isPrivilegedAdmin() {
  return hasAdminSession();
}
