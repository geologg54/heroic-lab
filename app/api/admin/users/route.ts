// app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { orders: true } }
      }
    }),
    prisma.user.count({ where })
  ])

  const formattedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    ordersCount: u._count.orders
  }))

  return NextResponse.json({
    users: formattedUsers,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  })
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { id, role } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Требуется ID пользователя' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role }
  })

  return NextResponse.json(user)
}