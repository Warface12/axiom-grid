import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { globalSearch } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) {
    return NextResponse.json({ casinos: [], bonuses: [], guides: [], sports: [], teams: [], leagues: [] });
  }
  const results = await globalSearch(q);
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path : "/";
    const referrer = typeof body.referrer === "string" ? body.referrer : null;
    const visitorId = typeof body.visitorId === "string" ? body.visitorId : null;

    const supabase = await createSupabaseServiceClient();
    if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });

    await supabase.from("page_view").insert({
      path,
      referrer,
      visitor_id: visitorId,
      user_agent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
