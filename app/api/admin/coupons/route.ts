// app/api/admin/coupons/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — список всех купонов
export async function GET() {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(coupons)
}

// POST — создание нового купона
export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const data = await request.json()
  const {
    code,
    type,
    value,
    minOrderAmount,
    maxUses,
    validFrom,
    validUntil,
    isActive,
  } = data

  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: 'Не заполнены обязательные поля' }, { status: 400 })
  }

  // Проверяем уникальность кода
  const existing = await prisma.coupon.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: 'Купон с таким кодом уже существует' }, { status: 400 })
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.trim().toUpperCase(),
      type,
      value: parseInt(value),
      minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive ?? true,
    },
  })

  return NextResponse.json(coupon, { status: 201 })
}