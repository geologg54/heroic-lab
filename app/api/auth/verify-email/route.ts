// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url))
  }

  try {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token, emailVerified: false }
    })

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url))
    }

    // Подтверждаем почту и удаляем токен
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      }
    })

    return NextResponse.redirect(new URL("/login?verified=1", request.url))
  } catch (error) {
    console.error("Ошибка верификации:", error)
    return NextResponse.redirect(new URL("/login?error=verify_error", request.url))
  }
}