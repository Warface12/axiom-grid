import { NextRequest, NextResponse } from "next/server";
import { syncSearchConsoleMetrics } from "@/lib/actions/searchConsole";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ success: false, error: "CRON_SECRET is not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  try { return NextResponse.json(await syncSearchConsoleMetrics()); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Search Console sync failed." }, { status: 500 }); }
}
