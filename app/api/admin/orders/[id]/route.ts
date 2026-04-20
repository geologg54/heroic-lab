// app/api/admin/orders/[id]/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: { category: true }
          }
        }
      },
      coupon: true // если есть купон
    }
  })

  if (!order) {
    return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
  }

  // Добавляем вычисляемое поле для удобства
  const formattedOrder = {
    ...order,
    customerName: order.user?.name || order.guestName || order.guestEmail || 'Гость',
    customerEmail: order.user?.email || order.guestEmail || '—',
    customerPhone: order.phone || '—'
  }

  return NextResponse.json(formattedOrder)
}