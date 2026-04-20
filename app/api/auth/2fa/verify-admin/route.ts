// app/api/auth/2fa/verify-admin/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { verifyTOTP } from '@/lib/twoFactor'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { code } = await request.json()
  if (!code) {
    return NextResponse.json({ error: 'Код обязателен' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true }
  })

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: '2FA не включена' }, { status: 400 })
  }

  const isValid = verifyTOTP(code, user.twoFactorSecret)
  if (!isValid) {
    return NextResponse.json({ error: 'Неверный код' }, { status: 400 })
  }

  // Успех – клиент вызовет update() для установки флага в сессии
  return NextResponse.json({ success: true })
}