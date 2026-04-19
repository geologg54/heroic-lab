// app/api/admin/coupons/[id]/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT — обновление купона
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { id } = await params
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

  // Проверяем, не занят ли новый код другим купоном
  if (code) {
    const existing = await prisma.coupon.findFirst({
      where: { code, id: { not: id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Купон с таким кодом уже существует' }, { status: 400 })
    }
  }

  const updateData: any = {}
  if (code !== undefined) updateData.code = code.trim().toUpperCase()
  if (type !== undefined) updateData.type = type
  if (value !== undefined) updateData.value = parseInt(value)
  if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? parseInt(minOrderAmount) : null
  if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null
  if (validFrom !== undefined) updateData.validFrom = new Date(validFrom)
  if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null
  if (isActive !== undefined) updateData.isActive = isActive

  const coupon = await prisma.coupon.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(coupon)
}

// DELETE — удаление купона
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { id } = await params

  // Проверяем, использовался ли купон
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { orders: true },
  })

  if (coupon && coupon.orders.length > 0) {
    // Вместо удаления лучше деактивировать
    return NextResponse.json(
      { error: 'Нельзя удалить купон, который уже использовался. Деактивируйте его.' },
      { status: 400 }
    )
  }

  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ success: true })
}