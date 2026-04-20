// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Защита админских маршрутов
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url))
      }
      // Проверка 2FA для админа
      if (token?.twoFactorEnabled && !token?.twoFactorVerified) {
        const url = new URL("/auth/2fa", req.url)
        url.searchParams.set("callbackUrl", path)
        return NextResponse.redirect(url)
      }
    }

    // Защита личного кабинета
    if (path.startsWith("/account") && !token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}