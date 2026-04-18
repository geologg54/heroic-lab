// app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

// GET – получить данные текущего пользователя
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

// PUT – обновить профиль (имя, email, пароль)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, currentPassword, newPassword } = await request.json()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const updateData: any = {}

  if (name !== undefined) {
    updateData.name = name
  }

  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'Email уже используется' }, { status: 400 })
    }
    updateData.email = email
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Требуется текущий пароль' }, { status: 400 })
    }
    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 })
    }
    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true }
  })

  return NextResponse.json(updatedUser)
}