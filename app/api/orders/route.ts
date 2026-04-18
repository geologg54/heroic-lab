// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { items, address, phone, comment, deliveryMethod, paymentMethod } = await request.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 })
  }
  if (!address || address.trim() === '') {
    return NextResponse.json({ error: 'Адрес доставки обязателен' }, { status: 400 })
  }

  // Рассчитываем общую сумму (можно также доверять переданной сумме, но пересчитаем для безопасности)
  const total = items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0)

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        address,
        phone: phone || null,
        comment: comment || null,
        deliveryMethod: deliveryMethod || null,
        paymentMethod: paymentMethod || null,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            productArticle: item.product.article,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
      include: { items: true },
    })

    // Очищаем корзину пользователя после успешного создания заказа
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } })

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания заказа:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}