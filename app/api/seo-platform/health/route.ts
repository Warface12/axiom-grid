import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    service: "TopPick SEO Platform",
    searchConsole: Boolean(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL && (process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN)),
    supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    cron: Boolean(process.env.CRON_SECRET),
    timestamp: new Date().toISOString(),
  });
}
