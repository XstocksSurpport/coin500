import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Override Next.js default /favicon.ico (black N) with our app icon. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/favicon.ico") {
    const url = request.nextUrl.clone();
    url.pathname = "/icon";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/favicon.ico",
};
