// app/api/coupons/validate/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { code, orderAmount } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Код купона не указан' }, { status: 400 })
    }

    // Ищем купон по коду (без учёта регистра)
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: code.trim(),
          mode: 'insensitive', // не зависит от регистра
        },
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

    // Проверяем лимит использований
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Лимит использований купона исчерпан' }, { status: 400 })
    }

    // Проверяем минимальную сумму заказа
    if (coupon.minOrderAmount !== null && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        error: `Минимальная сумма заказа для этого купона: ${coupon.minOrderAmount} ₽`,
      }, { status: 400 })
    }

    // Рассчитываем скидку
    let discount = 0
    if (coupon.type === 'percent') {
      discount = Math.round((orderAmount * coupon.value) / 100)
    } else {
      discount = coupon.value
    }

    // Скидка не может превышать сумму заказа
    discount = Math.min(discount, orderAmount)

    return NextResponse.json({
      valid: true,
      discount,
      finalAmount: orderAmount - discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    })
  } catch (error) {
    console.error('Ошибка проверки купона:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}