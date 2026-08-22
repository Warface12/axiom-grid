import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasAdminSession } from "@/lib/admin-auth";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll(){return cookieStore.getAll()},setAll(cookiesToSet){try{cookiesToSet.forEach(({name,value,options})=>cookieStore.set(name,value,options))}catch{}}}});
}

export async function isAdminUser() {
  if (await hasAdminSession()) return true;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false;
  try {
    const supabase=await createClient();
    const {data:{user},error}=await supabase.auth.getUser();
    if(error||!user)return false;
    const adminEmail=(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
    return Boolean(adminEmail&&user.email?.toLowerCase()===adminEmail);
  } catch { return false; }
}
export async function requireAdmin(){if(!(await isAdminUser()))throw new Error("Unauthorized admin action");return true}
