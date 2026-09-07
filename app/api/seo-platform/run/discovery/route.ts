import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cronAuth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const denied = requireCronSecret(request);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    ran: false,
    reason: "Discovery is armed but does not scrape by default. OWNER ACTION REQUIRED: enable a source allow-list before auto-discovery.",
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
