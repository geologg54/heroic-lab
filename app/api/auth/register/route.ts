// app/api/auth/register/route.ts
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Пользователь не подтвердил почту – можно переотправить токен (но пока просто сообщим)
        return NextResponse.json(
          { error: "Пользователь с таким email уже существует, но почта не подтверждена. Проверьте почту или запросите повторную отправку." },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Генерируем уникальный токен подтверждения
    const verifyToken = crypto.randomBytes(32).toString("hex")

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
        emailVerifyToken: verifyToken,
        emailVerified: false,
      }
    })

    // Отправляем письмо для подтверждения
    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verifyToken}`

    await sendEmail({
      to: email,
      subject: "Подтверждение email",
      text: `Здравствуйте, ${name || 'пользователь'}!\n\nДля подтверждения email перейдите по ссылке:\n${verifyLink}\n\nЕсли вы не регистрировались на сайте, просто проигнорируйте это письмо.`,
    }).catch(err => {
      console.error("Ошибка отправки письма подтверждения:", err)
      // Не фатально, токен уже сохранён
    })

    return NextResponse.json(
      { message: "Пользователь создан. На почту отправлено письмо для подтверждения.", user: { id: user.id, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Ошибка регистрации:", error)
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    )
  }
}