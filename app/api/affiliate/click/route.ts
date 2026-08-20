import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const casinoId = typeof body.casinoId === "string" ? body.casinoId : null;
    const bonusId = typeof body.bonusId === "string" ? body.bonusId : null;
    const sourcePage = typeof body.sourcePage === "string" ? body.sourcePage : null;
    const visitorId = typeof body.visitorId === "string" ? body.visitorId : null;

    if (!casinoId && !bonusId) {
      return NextResponse.json({ error: "casinoId or bonusId required" }, { status: 400 });
    }

    const supabase = await createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    let partnerId: string | null = null;
    if (casinoId) {
      const { data: casino } = await supabase
        .from("casino")
        .select("affiliate_partner_id, affiliate_url")
        .eq("id", casinoId)
        .maybeSingle();
      partnerId = casino?.affiliate_partner_id || null;
    }

    await supabase.from("affiliate_click").insert({
      casino_id: casinoId,
      bonus_id: bonusId,
      partner_id: partnerId,
      source_page: sourcePage,
      visitor_id: visitorId,
      user_agent: request.headers.get("user-agent"),
      ip_hash: null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
