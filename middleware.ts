import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?)$/i;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/_next/") || PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const region = (request.headers.get("x-vercel-ip-country-region") || "").toUpperCase();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nivaro-country", country);
  requestHeaders.set("x-nivaro-region", region);

  // Keep the root <html lang> aligned with localized market URLs for hreflang/SEO.
  const marketLocale = pathname.match(/^\/markets\/[^/]+\/([a-z]{2})(?:\/|$)/i)?.[1]?.toLowerCase();
  requestHeaders.set("x-nivaro-lang", marketLocale || "en");

  // Admin login must remain reachable from Georgia so the owner can authenticate.
  if (pathname === "/admin/login" || pathname.startsWith("/auth/")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  let isOwner = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.ADMIN_EMAIL) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    isOwner = Boolean(user?.email && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
  }

  if (isOwner) {
    requestHeaders.set("x-nivaro-owner", "1");
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Georgia public block is intentionally OFF during development/testing.
  // Set GE_BLOCK_ENABLED=true in Vercel only when you are ready to enable it.
  const geBlockEnabled = process.env.GE_BLOCK_ENABLED === "true";
  if (geBlockEnabled && country === "GE" && !isOwner) {
    if (pathname === "/unavailable") return response;
    const url = request.nextUrl.clone();
    url.pathname = "/unavailable";
    url.search = "";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
