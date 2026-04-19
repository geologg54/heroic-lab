// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sendEmail, getNewOrderAdminEmail, getOrderConfirmationEmail } from '@/lib/email'

// Проверка корректности email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Проверка телефона (цифры, пробелы, +, -, (, ))
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\+\-\(\)]+$/
  return phoneRegex.test(phone)
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const body = await request.json()
    const {
      items,
      address,
      phone,
      comment,
      deliveryMethod,
      paymentMethod,
      email,        // email, переданный клиентом (для гостей обязателен)
      name,         // имя, переданное клиентом
      couponId,     // 🆕 ID применённого купона
      discount = 0, // 🆕 сумма скидки
    } = body

    // --- ВАЛИДАЦИЯ ---
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 })
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json(
        { error: 'Укажите полный адрес доставки (минимум 5 символов)' },
        { status: 400 }
      )
    }

    let guestEmail: string | undefined = undefined
    let guestName: string | undefined = undefined

    // Если пользователь НЕ авторизован, email обязателен
    if (!userId) {
      if (!email || typeof email !== 'string' || !isValidEmail(email)) {
        return NextResponse.json(
          { error: 'Укажите корректный email для связи' },
          { status: 400 }
        )
      }
      guestEmail = email.trim().toLowerCase()
      guestName = name?.trim() || undefined
    } else {
      // Авторизован: email не обязателен, но если передан – валидируем
      if (email) {
        if (!isValidEmail(email)) {
          return NextResponse.json(
            { error: 'Некорректный формат email' },
            { status: 400 }
          )
        }
        guestEmail = email.trim().toLowerCase()
      }
      if (name) {
        guestName = name.trim()
      }
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Некорректный формат номера телефона' },
        { status: 400 }
      )
    }

    // 🆕 Если передан couponId, проверяем его существование и активность
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      })
      if (!coupon) {
        return NextResponse.json({ error: 'Купон не найден' }, { status: 400 })
      }
      if (!coupon.isActive) {
        return NextResponse.json({ error: 'Купон неактивен' }, { status: 400 })
      }
      if (coupon.validUntil && coupon.validUntil < new Date()) {
        return NextResponse.json({ error: 'Срок действия купона истёк' }, { status: 400 })
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: 'Лимит использований купона исчерпан' }, { status: 400 })
      }
      // Дополнительно можно проверить minOrderAmount, но это уже делалось на клиенте
    }

    // Подсчёт суммы заказа (без скидки)
    const itemsTotal = items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    )

    // Итоговая сумма с учётом скидки
    const total = Math.max(itemsTotal - discount, 0)

    // Генерируем следующий номер заказа
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    })
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 100001

    // Создаём заказ в базе
    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber,
        userId: userId || undefined,
        guestEmail: guestEmail,
        guestName: guestName,
        total,
        discount,               // 🆕 сохраняем сумму скидки
        address: address.trim(),
        phone: phone?.trim() || null,
        comment: comment?.trim() || null,
        deliveryMethod: deliveryMethod || null,
        paymentMethod: paymentMethod || null,
        status: 'processing',
        couponId: couponId || null, // 🆕 связь с купоном
        items: {
          create: items.map((item: any) => ({
            productArticle: item.product.article,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    })

    // 🆕 Увеличиваем счётчик использований купона
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Очищаем корзину только для авторизованных пользователей
    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } })
    }

    // Определяем email покупателя для отправки письма
    const customerEmail = guestEmail || session?.user?.email

    // Отправляем письма (асинхронно, не блокируем ответ)
    if (customerEmail) {
      Promise.all([
        sendEmail({
          to: customerEmail,
          ...getOrderConfirmationEmail(order),
        }).catch(err => console.error('Ошибка отправки письма покупателю:', err)),
        sendEmail({
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM!,
          ...getNewOrderAdminEmail(order),
        }).catch(err => console.error('Ошибка отправки письма админу:', err)),
      ])
    } else {
      console.warn(`Заказ ${order.id}: не удалось определить email покупателя, письмо не отправлено`)
    }

    return NextResponse.json(
      { orderId: order.id, orderNumber: order.orderNumber },
      { status: 201 }
    )
  } catch (error) {
    console.error('Ошибка создания заказа:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}