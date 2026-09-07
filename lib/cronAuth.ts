import { NextRequest, NextResponse } from "next/server";

export function requireCronSecret(request: NextRequest) {
  const secret = (process.env.CRON_SECRET || "").trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 503 });
  }
  const header = request.headers.get("authorization") || "";
  const query = request.nextUrl.searchParams.get("secret") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : query;
  if (presented !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
