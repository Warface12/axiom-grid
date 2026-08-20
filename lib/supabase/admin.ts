import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const FALLBACK_ADMIN_EMAIL = "kshota094@gmail.com";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can be read-only. Route handlers and actions
            // are responsible for session cookie writes.
          }
        },
      },
    }
  );
}

export async function isAdminUser() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return false;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return false;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL)
    .trim()
    .toLowerCase();

  return user.email.toLowerCase() === adminEmail;
}

export async function requireAdmin() {
  const allowed = await isAdminUser();

  if (!allowed) {
    throw new Error("Unauthorized admin action");
  }

  return true;
}
