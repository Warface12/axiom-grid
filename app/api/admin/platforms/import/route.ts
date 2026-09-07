import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb, hostnameOf } from "@/lib/adminDb";
import { importPublicPlatformMetadata } from "@/lib/urlImport";
import { parsePublicHttpUrl } from "@/lib/httpUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const url = String(body.url || "").trim();
  const parsed = parsePublicHttpUrl(url);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

  try {
    const imported = await importPublicPlatformMetadata(url);
    const host = hostnameOf(imported.finalUrl);
    const supabase = adminDb();
    let duplicates: { id: string; name: string; slug: string; kind: string }[] = [];
    if (supabase && host) {
      const { data } = await supabase.from("platform").select("id,name,slug,kind,official_url,affiliate_url");
      duplicates = (data || []).filter((row) => hostnameOf(row.official_url) === host || hostnameOf(row.affiliate_url) === host);
    }
    if (supabase) {
      const { error: draftError } = await supabase.from("platform_import_draft").insert({
        source_url: imported.sourceUrl,
        final_url: imported.finalUrl,
        hostname: host,
        payload: imported.fields,
        provenance: { retrievedAt: imported.retrievedAt, httpStatus: imported.httpStatus, needsReview: imported.needsReview },
        duplicate_platform_id: duplicates[0]?.id || null,
        status: duplicates.length ? "duplicate" : "needs_review",
      });
      if (draftError && !/relation|schema cache|does not exist/i.test(draftError.message)) {
        return NextResponse.json({ ok: false, error: draftError.message }, { status: 500 });
      }
    }
    const missing = Object.entries(imported.fields)
      .filter(([, field]) => field.status === "missing")
      .map(([key]) => key);
    return NextResponse.json({
      ok: true,
      imported: { ...imported, missing },
      duplicates,
      draftOnly: true,
      message: duplicates.length
        ? "Public metadata was collected, but a similar platform already exists. Review before creating another record."
        : "Public metadata was collected into a draft. Nothing was published.",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Import failed.",
      draftOnly: true,
    }, { status: 422 });
  }
}
