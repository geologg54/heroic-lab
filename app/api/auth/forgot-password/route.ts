// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email обязателен' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  })

  // Не раскрываем, существует ли пользователь, но если существует – отправляем письмо
  if (user) {
    // Удаляем старые токены для этого email
    await prisma.passwordResetToken.deleteMany({ where: { email: user.email } })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 час

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      }
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`

    await sendEmail({
      to: user.email,
      subject: 'Сброс пароля',
      text: `Здравствуйте!\n\nДля сброса пароля перейдите по ссылке:\n${resetLink}\n\nСсылка действительна 1 час.`,
    }).catch(err => console.error('Ошибка отправки письма сброса:', err))
  }

  // Всегда возвращаем успех, чтобы не раскрывать наличие email
  return NextResponse.json({
    success: true,
    message: 'Если email зарегистрирован, на него отправлена инструкция по сбросу пароля.'
  })
}