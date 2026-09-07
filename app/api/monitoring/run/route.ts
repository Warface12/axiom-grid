import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cronAuth";
import { runMonitoringCycle } from "@/lib/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireCronSecret(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await runMonitoringCycle());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Monitoring failed" }, { status: 500 });
  }
}
