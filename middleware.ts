import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

const PUBLIC_FILE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?)$/i;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next/") || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const valid = await verifyAdminSession(request.cookies.get("axiom_admin")?.value);
    if (!valid) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  }

  const headers = new Headers(request.headers);
  headers.set("x-site-country", (request.headers.get("x-vercel-ip-country") || "").toUpperCase());
  headers.set("x-site-region", (request.headers.get("x-vercel-ip-country-region") || "").toUpperCase());
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
