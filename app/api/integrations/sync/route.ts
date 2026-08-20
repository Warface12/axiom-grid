import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { integrationManager, createSyncLogEntry } from "@/lib/integrations/manager";

async function isAuthorizedCron(request: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`) {
    return true;
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("admin_users").select("id").eq("id", user.id).eq("active", true).maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorizedCron(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const integrationId = typeof body.integrationId === "string" ? body.integrationId : null;

  let query = supabase.from("integration_config").select("*").eq("enabled", true);
  if (integrationId) query = query.eq("id", integrationId);

  const { data: integrations } = await query;
  const results = [];

  for (const config of integrations || []) {
    const logStart = await supabase.from("sync_log").insert({
      integration_id: config.id,
      status: "started",
    }).select("id").single();

    const result = await integrationManager.sync(config);

    if (logStart.data?.id) {
      await supabase.from("sync_log").update(createSyncLogEntry(result, config.id)).eq("id", logStart.data.id);
    }

    await supabase.from("integration_config").update({
      last_synced_at: new Date().toISOString(),
    }).eq("id", config.id);

    results.push({ integrationId: config.id, provider: config.provider, ...result });
  }

  return NextResponse.json({ results });
}
