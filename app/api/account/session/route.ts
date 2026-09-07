import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/admin";
import { oauthProviders } from "@/lib/auth/publicUser";

export async function GET() {
  return NextResponse.json({
    ok: true,
    authConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    oauth: oauthProviders(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const mode = body.mode === "signup" ? "signup" : "signin";
  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json({ ok: false, error: "Use a valid email and a password of at least 8 characters." }, { status: 400 });
  }
  try {
    const supabase = await createClient();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) return NextResponse.json({ ok: false, error: result.error.message }, { status: 400 });
    return NextResponse.json({ ok: true, needsEmailConfirm: mode === "signup" && !result.data.session });
  } catch {
    return NextResponse.json({ ok: false, error: "OWNER ACTION REQUIRED: Supabase Auth is not configured." }, { status: 503 });
  }
}
