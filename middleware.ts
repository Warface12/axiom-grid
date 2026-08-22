import {NextResponse,type NextRequest} from "next/server";
export function middleware(request:NextRequest){
  const headers=new Headers(request.headers);
  const manual=(request.cookies.get("toppick_market")?.value||"").toUpperCase().trim();
  const geo=(request.headers.get("x-vercel-ip-country")||"").toUpperCase().trim();
  const region=(request.headers.get("x-vercel-ip-country-region")||"").toUpperCase().trim();
  if(manual)headers.set("x-toppick-market-manual",manual);
  if(manual||geo)headers.set("x-toppick-market",manual||geo);
  if(region)headers.set("x-toppick-region",region);
  return NextResponse.next({request:{headers}});
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
