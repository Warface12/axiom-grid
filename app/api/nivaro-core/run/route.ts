import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { runScheduledMonitoringChecks } from "@/lib/actions/monitoring";
import { evaluateCasinoMarkets, syncBonusMarketCompliance } from "@/lib/nivaro-core/compliance-engine";
import { syncAllOfficialRegistries } from "@/lib/nivaro-core/registry";
import { refreshCasinoOffers } from "@/lib/nivaro-core/offer-monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const supabase = await createSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ success: false, error: "SUPABASE_SERVICE_ROLE_KEY missing" }, { status: 503 });

  const startedAt = new Date().toISOString();
  const summary: any = { startedAt, registry: null, monitoring: null, complianceChecked: 0, offersRefreshed: 0, offerChanges: 0, errors: [] as string[] };

  try {
    const { data: lastRegistry } = await supabase.from("market_registry_sync").select("finished_at").eq("status", "success").order("finished_at", { ascending: false }).limit(1).maybeSingle();
    const stale = !lastRegistry?.finished_at || Date.now() - new Date(lastRegistry.finished_at).getTime() > 18 * 60 * 60 * 1000;
    if (stale) summary.registry = await syncAllOfficialRegistries();
  } catch (error) { summary.errors.push(`registry: ${error instanceof Error ? error.message : "failed"}`); }

  try { summary.monitoring = await runScheduledMonitoringChecks(); }
  catch (error) { summary.errors.push(`monitoring: ${error instanceof Error ? error.message : "failed"}`); }

  try {
    const now = new Date().toISOString();
    const { data: due } = await supabase.from("casino").select("id").eq("active", true).or(`next_check_at.is.null,next_check_at.lte.${now}`).limit(120);
    const queue = due || [];
    const concurrency = 6;
    for (let offset = 0; offset < queue.length; offset += concurrency) {
      const batch = queue.slice(offset, offset + concurrency);
      const results = await Promise.allSettled(batch.map(async (casino) => {
        await evaluateCasinoMarkets(casino.id);
        const offerResult = await refreshCasinoOffers(casino.id);
        await syncBonusMarketCompliance(casino.id);
        return { casinoId: casino.id, offerResult };
      }));
      for (const result of results) {
        if (result.status === "rejected") {
          summary.errors.push(`casino batch item: ${result.reason instanceof Error ? result.reason.message : "failed"}`);
          continue;
        }
        summary.complianceChecked++;
        summary.offersRefreshed += result.value.offerResult.found;
        summary.offerChanges += result.value.offerResult.changed;
      }
    }
  } catch (error) { summary.errors.push(`compliance: ${error instanceof Error ? error.message : "failed"}`); }

  return NextResponse.json({ success: summary.errors.length === 0, ...summary, finishedAt: new Date().toISOString() });
}
