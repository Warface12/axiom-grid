import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";

const ADMIN_EMAIL = "kshota094@gmail.com";
// SHA-256 verifier only. The plaintext password is intentionally not stored in source.
const ADMIN_PASSWORD_SHA256 = "0e4525b7d2e0b157bef1c86163deeefbba1d5d3d0696083c884ed6d4ec407486";

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  const passwordHash = await sha256Hex(password);

  if (email !== ADMIN_EMAIL || passwordHash !== ADMIN_PASSWORD_SHA256) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = await createAdminSession(ADMIN_EMAIL);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("axiom_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
