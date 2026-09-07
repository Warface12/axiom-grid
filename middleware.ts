import { NextResponse, type NextRequest } from "next/server";

async function lookupRedirect(pathname: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (pathname.startsWith("/api") || pathname.startsWith("/admin") || pathname.startsWith("/_next") || pathname.startsWith("/go")) return null;
  try {
    const endpoint = `${url}/rest/v1/seo_redirect?from_path=eq.${encodeURIComponent(pathname)}&select=to_path,permanent&limit=1`;
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(400),
    });
    if (!res.ok) return null;
    const rows = await res.json() as { to_path?: string; permanent?: boolean }[];
    const row = rows?.[0];
    if (!row?.to_path?.startsWith("/") || row.to_path.startsWith("//")) return null;
    return row;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const manual = (request.cookies.get("toppick_market")?.value || "").toUpperCase().trim();
  const geo = (request.headers.get("x-vercel-ip-country") || "").toUpperCase().trim();
  const region = (request.headers.get("x-vercel-ip-country-region") || "").toUpperCase().trim();
  if (manual) headers.set("x-toppick-market-manual", manual);
  if (manual || geo) headers.set("x-toppick-market", manual || geo);
  if (region) headers.set("x-toppick-region", region);
  const hit = await lookupRedirect(request.nextUrl.pathname);
  if (hit?.to_path) {
    return NextResponse.redirect(new URL(hit.to_path, request.url), hit.permanent === false ? 307 : 308);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html).*)"] };
