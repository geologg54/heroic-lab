// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sendEmail, getNewOrderAdminEmail, getOrderConfirmationEmail } from '@/lib/email'

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

  const total = items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0)

  try {
    // Генерируем следующий номер заказа
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true }
    })
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100001

    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber,
        userId: session.user.id,
        total,
        address,
        phone: phone || null,
        comment: comment || null,
        deliveryMethod: deliveryMethod || null,
        paymentMethod: paymentMethod || null,
        status: 'processing', // новый заказ сразу в работе
        items: {
          create: items.map((item: any) => ({
            productArticle: item.product.article,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    })

    // Очищаем корзину
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } })

    // Отправляем письма (асинхронно, не блокируем ответ)
    Promise.all([
      sendEmail({
        to: session.user.email,
        ...getOrderConfirmationEmail(order),
      }).catch(err => console.error('Failed to send confirmation email:', err)),
      sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM!,
        ...getNewOrderAdminEmail(order),
      }).catch(err => console.error('Failed to send admin notification:', err)),
    ])

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания заказа:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}