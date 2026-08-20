"use server";

import { createSign } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken() {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!clientEmail || !privateKey) throw new Error("Search Console service-account credentials are not configured.");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString("base64url");
  const assertion = `${unsigned}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.access_token) throw new Error(payload?.error_description || payload?.error || `Google OAuth returned HTTP ${response.status}.`);
  return String(payload.access_token);
}

function isoDate(daysAgo: number) {
  const date = new Date(Date.now() - daysAgo * 86400000);
  return date.toISOString().slice(0, 10);
}

export async function syncSearchConsoleMetrics() {
  const property = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || "sc-domain:nivarobet.best";
  const token = await getAccessToken();
  const endDate = isoDate(2);
  const startDate = isoDate(9);
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate, dimensions: ["date", "query", "page", "country", "device"], type: "web", rowLimit: 25000 }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Search Console API returned HTTP ${response.status}.`);

  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const supabase = await createSupabaseServiceClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  const records = rows.map((row: any) => ({
    property,
    data_date: String(row?.keys?.[0] || endDate),
    query: String(row?.keys?.[1] || ""),
    page: String(row?.keys?.[2] || ""),
    country: String(row?.keys?.[3] || ""),
    device: String(row?.keys?.[4] || ""),
    clicks: Number(row?.clicks || 0),
    impressions: Number(row?.impressions || 0),
    ctr: Number(row?.ctr || 0),
    position: Number(row?.position || 0),
  }));

  for (let index = 0; index < records.length; index += 500) {
    const chunk = records.slice(index, index + 500);
    const { error } = await supabase.from("search_console_metric").upsert(chunk, { onConflict: "property,data_date,query,page,country,device" });
    if (error) throw new Error(`Search Console metric save failed: ${error.message}`);
  }
  return { success: true, property, startDate, endDate, rows: records.length };
}

export async function getSearchConsoleOpportunities(limit = 50) {
  const supabase = await createSupabaseServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("search_console_metric")
    .select("page,query,country,device,clicks,impressions,ctr,position,data_date")
    .gte("impressions", 5)
    .gte("position", 5)
    .lte("position", 40)
    .order("impressions", { ascending: false })
    .limit(limit);
  if (error) { console.error("getSearchConsoleOpportunities:", error.message); return []; }
  return data || [];
}


export async function syncSearchConsoleMetricsForAdmin() {
  const { requireAdmin } = await import("@/lib/supabase/admin");
  const { revalidatePath } = await import("next/cache");
  await requireAdmin();
  const result = await syncSearchConsoleMetrics();
  revalidatePath("/admin/seo");
  return result;
}
