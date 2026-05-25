import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (e) {
    console.error("middleware", e);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/cyber-tech/:path*",
    "/cyber-tech",
    "/api/auth/:path*",
  ],
};
