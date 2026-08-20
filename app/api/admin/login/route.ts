import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const FALLBACK_ADMIN_EMAIL = "kshota094@gmail.com";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: string; password?: string }
      | null;

    const email = body?.email?.trim().toLowerCase() || "";
    const password = body?.password || "";
    const adminEmail = (process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL)
      .trim()
      .toLowerCase();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Fail closed: only the configured Axiom administrator account may use
    // the private control-room login, even if other Supabase users exist.
    if (email !== adminEmail) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    if (data.user.email?.toLowerCase() !== adminEmail) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // createSupabaseServerClient writes the Supabase auth cookies through
    // next/headers during signInWithPassword. The protected admin layout then
    // validates the user server-side with auth.getUser().
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Axiom admin login failed:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
