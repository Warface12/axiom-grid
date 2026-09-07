import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/admin";
import { isPublicAuthConfigured, oauthProviders } from "@/lib/auth/publicUser";
import { logAuthFailure, publicAuthMessage } from "@/lib/auth/publicErrors";

export async function GET() {
  return NextResponse.json({
    ok: true,
    authConfigured: isPublicAuthConfigured(),
    oauth: oauthProviders(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body.mode === "signout") {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch (error) {
      logAuthFailure("account.session.signout", error);
    }
    return NextResponse.json({ ok: true });
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const confirm = String(body.confirm || "");
  const mode = body.mode === "signup" ? "signup" : "signin";
  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json({ ok: false, error: "Use a valid email and a password of at least 8 characters." }, { status: 400 });
  }
  if (mode === "signup") {
    if (password !== confirm) {
      return NextResponse.json({ ok: false, error: "Passwords do not match." }, { status: 400 });
    }
    if (!body.acceptedTerms) {
      return NextResponse.json({ ok: false, error: "Please accept the terms and privacy policy to create an account." }, { status: 400 });
    }
  }
  if (!isPublicAuthConfigured()) {
    logAuthFailure("account.session", "auth not configured");
    return NextResponse.json({ ok: false, error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  try {
    const supabase = await createClient();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      logAuthFailure("account.session", result.error.message);
      return NextResponse.json({ ok: false, error: publicAuthMessage(result.error.message) }, { status: 400 });
    }
    return NextResponse.json({ ok: true, needsEmailConfirm: mode === "signup" && !result.data.session });
  } catch (error) {
    logAuthFailure("account.session", error);
    return NextResponse.json({ ok: false, error: publicAuthMessage(error) }, { status: 503 });
  }
}
