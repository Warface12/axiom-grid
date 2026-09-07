import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cronAuth";
import { runDailySeoPlatform } from "@/lib/seoPlatform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireCronSecret(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await runDailySeoPlatform());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "SEO cycle failed" }, { status: 500 });
  }
}
