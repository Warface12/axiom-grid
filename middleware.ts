import { NextResponse, type NextRequest } from "next/server";
const PUBLIC_FILE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?)$/i;
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/_next/") || PUBLIC_FILE.test(request.nextUrl.pathname)) return NextResponse.next();
  const h = new Headers(request.headers);
  h.set("x-site-country", (request.headers.get("x-vercel-ip-country") || "").toUpperCase());
  h.set("x-site-region", (request.headers.get("x-vercel-ip-country-region") || "").toUpperCase());
  return NextResponse.next({request:{headers:h}});
}
export const config = { matcher:["/((?!_next/static|_next/image|favicon.ico).*)"] };
