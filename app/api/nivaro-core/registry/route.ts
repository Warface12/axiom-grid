import { NextRequest, NextResponse } from "next/server";
import { syncAllOfficialRegistries } from "@/lib/nivaro-core/registry";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const results = await syncAllOfficialRegistries();
  return NextResponse.json({ success: true, results });
}
