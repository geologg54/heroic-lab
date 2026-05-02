// app/api/coupons/validate/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ValidateItem {
  article: string
  name: string
  price: number
  quantity: number
  oldPrice?: number | null
}

export async function POST(request: Request) {
  try {
    const { code, items } = (await request.json()) as { code: string; items: ValidateItem[] }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Код купона не указан' }, { status: 400 })
    }

    // Ищем купон
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: { equals: code.trim(), mode: 'insensitive' },
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
        validFrom: { lte: new Date() },
      },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Купон не найден или срок его действия истёк' }, { status: 404 })
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        error: 'У промокода закончилось количество использований. Введите другой промокод.'
      }, { status: 400 })
    }

    const orderAmount = items.reduce((sum: number, item: ValidateItem) => sum + item.price * item.quantity, 0)

    // Проверка минимальной суммы (общая)
    if (coupon.minOrderAmount !== null && orderAmount < coupon.minOrderAmount) {
      const diff = coupon.minOrderAmount - orderAmount
      return NextResponse.json({
        error: `Минимальная сумма заказа ${coupon.minOrderAmount} ₽, вам нужно заказать еще на ${diff} ₽ или введите другой промокод. <a href="/catalog" class="underline text-accent">Перейти в Каталог</a>`
      }, { status: 400 })
    }

    // Разделяем товары: акционные (с oldPrice) и обычные
    const saleItems = items.filter((item: ValidateItem) => item.oldPrice)
    const regularItems = items.filter((item: ValidateItem) => !item.oldPrice)

    let appliedItems: { article: string; discount: number }[] = []
    let totalDiscount = 0

    if (coupon.stackable) {
      // Суммируется – применяем ко всем товарам
      for (const item of items) {
        const itemTotal = item.price * item.quantity
        let discount = 0
        if (coupon.type === 'percent') {
          discount = Math.round((itemTotal * coupon.value) / 100)
        } else {
          discount = Math.min(itemTotal, coupon.value / items.length)
        }
        if (discount > 0) appliedItems.push({ article: item.article, discount })
        totalDiscount += discount
      }
    } else {
      // Не суммируется – применяем только к обычным товарам
      if (regularItems.length === 0) {
        return NextResponse.json({
          error: 'Промокод не суммируется с другими акциями. Необходимо добавить товары, подходящие под условия, или введите другой промокод.'
        }, { status: 400 })
      }

      for (const item of regularItems) {
        const itemTotal = item.price * item.quantity
        let discount = 0
        if (coupon.type === 'percent') {
          discount = Math.round((itemTotal * coupon.value) / 100)
        } else {
          discount = Math.min(itemTotal, coupon.value / regularItems.length)
        }
        if (discount > 0) appliedItems.push({ article: item.article, discount })
        totalDiscount += discount
      }

      // Если есть акционные товары, выводим предупреждение
      if (saleItems.length > 0) {
        const names = saleItems.map((i: ValidateItem) => `"${i.article}" "${i.name}"`).join(', ')
        return NextResponse.json({
          error: `Скидка по промокоду применена не ко всем товарам. ${names} не подходит под условие промокода.`
        }, { status: 400 })
      }
    }

    // Проверка минимальной суммы для товаров, к которым применён купон
    if (coupon.minOrderAmount !== null) {
      const eligibleAmount = items
        .filter((item: ValidateItem) => appliedItems.some(a => a.article === item.article))
        .reduce((sum: number, item: ValidateItem) => sum + item.price * item.quantity, 0)

      if (eligibleAmount < coupon.minOrderAmount) {
        const diff = coupon.minOrderAmount - eligibleAmount
        const saleNames = saleItems.map((i: ValidateItem) => `"${i.article}" "${i.name}"`).join(', ')
        return NextResponse.json({
          error: `Минимальная сумма для заказа ${coupon.minOrderAmount} ₽, товар ${saleNames} не подходит по условиям промокода, добавьте товары, удовлетворяющие условиям. <a href="/catalog" class="underline text-accent">Перейти в Каталог</a>`
        }, { status: 400 })
      }
    }

    totalDiscount = Math.min(totalDiscount, orderAmount)

    return NextResponse.json({
      valid: true,
      discount: totalDiscount,
      finalAmount: orderAmount - totalDiscount,
      appliedItems,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        stackable: coupon.stackable,
      },
    })
  } catch (error) {
    console.error('Ошибка проверки купона:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}