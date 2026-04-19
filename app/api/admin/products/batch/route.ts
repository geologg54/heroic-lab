// app/api/admin/products/batch/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { articles, updates } = await request.json()
  
  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return NextResponse.json({ error: 'Не выбрано ни одного товара' }, { status: 400 })
  }
  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
  }

  // Разрешённые поля для массового обновления
  const allowedFields = ['categoryId', 'price', 'oldPrice', 'featured', 'gameSystem', 'scale', 'type']
  const updateData: any = {}
  for (const field of allowedFields) {
    if (field in updates) {
      updateData[field] = updates[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Нет разрешённых полей для обновления' }, { status: 400 })
  }

  // Преобразуем цену в число, если она передана
  if (updateData.price !== undefined) {
    updateData.price = parseInt(updateData.price)
  }
  if (updateData.oldPrice !== undefined) {
    updateData.oldPrice = updateData.oldPrice ? parseInt(updateData.oldPrice) : null
  }

  const result = await prisma.product.updateMany({
    where: { article: { in: articles } },
    data: updateData,
  })

  return NextResponse.json({ 
    success: true, 
    updatedCount: result.count,
    message: `Обновлено ${result.count} товаров`
  })
}