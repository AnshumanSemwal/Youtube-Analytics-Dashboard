import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";

// Single NextAuth instance for middleware — no adapter, no crypto imports.
// Uses the same secret as auth.ts so session cookies are compatible.
const { auth } = NextAuth({
  providers:  [Google],
  secret:     process.env.AUTH_SECRET,
  trustHost:  true,
});

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/connect-channel");

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};