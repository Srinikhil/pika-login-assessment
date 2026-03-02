import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/app"];
const AUTH_PATHS = ["/login"];
const SESSION_KEY = "pika_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_KEY)?.value;

  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie));
      isAuthenticated =
        !!session?.token && new Date(session.expiresAt) > new Date();
    } catch {
      isAuthenticated = false;
    }
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
