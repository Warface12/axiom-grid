import {NextRequest,NextResponse} from "next/server";import {searchPublic} from "@/lib/searchIndex";
export async function GET(request:NextRequest){const q=request.nextUrl.searchParams.get("q")||"";if(q.trim().length<2)return NextResponse.json({items:[]});return NextResponse.json({items:await searchPublic(q,24)})}
