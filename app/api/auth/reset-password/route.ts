// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  const { token, password } = await request.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Токен и пароль обязательны' }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Токен недействителен или истёк' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword }
  })

  // Помечаем токен использованным
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true }
  })

  return NextResponse.json({ success: true })
}