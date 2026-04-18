// app/api/admin/orders/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sendEmail, getOrderStatusUpdateEmail } from '@/lib/email'

// GET – получение списка заказов с пагинацией и фильтром по статусу
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || undefined

  const where: any = {}
  if (status) where.status = status

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.order.count({ where })
  ])

  return NextResponse.json({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  })
}

// PUT – изменение статуса заказа
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  // Проверяем, что статус допустимый
  const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled']
  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    }
  })

  // Отправляем уведомление покупателю о смене статуса
  if (order.user.email) {
    sendEmail({
      to: order.user.email,
      ...getOrderStatusUpdateEmail(order),
    }).catch(err => console.error('Failed to send status update email:', err))
  }

  return NextResponse.json(order)
}