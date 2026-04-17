// app/api/auth/register/route.ts
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

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
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user", // по умолчанию
      }
    })

    return NextResponse.json(
      { message: "Пользователь создан", user: { id: user.id, email: user.email } },
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