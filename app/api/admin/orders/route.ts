// app/api/admin/orders/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/orders – список всех заказов (с фильтром по статусу)
export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined

  const where: any = {}
  if (status) {
    where.status = status
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  // Форматируем данные для удобства отображения
  const formattedOrders = orders.map(order => ({
    ...order,
    customerName: order.user?.name || order.guestName || order.guestEmail || 'Гость',
    customerEmail: order.user?.email || order.guestEmail,
  }))

  return NextResponse.json({ orders: formattedOrders })
}

// PUT /api/admin/orders – обновление статуса заказа
export async function PUT(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { id, status } = await request.json()

  if (!id || !status) {
    return NextResponse.json({ error: 'Не указан ID заказа или статус' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  })

  // TODO: Здесь можно добавить отправку письма покупателю о смене статуса

  return NextResponse.json(order)
}