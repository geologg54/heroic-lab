// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email обязателен" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, emailVerified: true, name: true }
  })

  if (!user) {
    // В целях безопасности не сообщаем, что пользователя нет
    return NextResponse.json({ success: true })
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: "Email уже подтверждён" })
  }

  // Генерируем новый токен
  const verifyToken = crypto.randomBytes(32).toString("hex")
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: verifyToken }
  })

  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verifyToken}`

  await sendEmail({
    to: email,
    subject: "Подтверждение email",
    text: `Здравствуйте, ${user.name || 'пользователь'}!\n\nДля подтверждения email перейдите по ссылке:\n${verifyLink}\n\nЕсли вы не регистрировались, проигнорируйте это письмо.`,
  }).catch(err => console.error("Ошибка отправки письма:", err))

  return NextResponse.json({ success: true })
}