// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { verifyTrustedToken, getTrustedCookieName } from "./lib/trustedDevice";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Проверяем 2FA
      if (token?.twoFactorEnabled && !token?.twoFactorVerified) {
        const trustedCookie = req.cookies.get(getTrustedCookieName());
        let isTrusted = false;
        if (trustedCookie?.value) {
          const userId = verifyTrustedToken(trustedCookie.value);
          isTrusted = userId === token.id;
        }

        if (!isTrusted) {
          const url = new URL("/auth/2fa", req.url);
          url.searchParams.set("callbackUrl", path);
          return NextResponse.redirect(url);
        }
      }
    }

    if (path.startsWith("/account") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};