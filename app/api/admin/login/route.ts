import { NextResponse } from "next/server";
import { COOKIE_NAME, createAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";

  if (!expectedEmail || !expectedPassword || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin login is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel." }, { status: 503 });
  }
  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = await createAdminSession(expectedEmail);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
