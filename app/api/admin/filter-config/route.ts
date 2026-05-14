// app/api/admin/filter-config/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — получить все настройки фильтров (можно фильтровать по категории)
export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('categorySlug')

  const where: any = {}
  if (categorySlug) {
    where.categorySlug = categorySlug
  }

  const configs = await prisma.filterConfig.findMany({
    where,
    orderBy: [{ categorySlug: 'asc' }, { sortOrder: 'asc' }],
  })

  return NextResponse.json(configs)
}

// POST — создать новую запись
export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const data = await request.json()
  const {
    categorySlug,
    filterField,
    title,
    type,
    parentField,
    parentValue,
    sortOrder = 0,
  } = data

  if (!categorySlug || !filterField || !title || !type) {
    return NextResponse.json(
      { error: 'Поля categorySlug, filterField, title, type обязательны' },
      { status: 400 }
    )
  }

  if (!['static', 'dynamic'].includes(type)) {
    return NextResponse.json(
      { error: 'Тип должен быть "static" или "dynamic"' },
      { status: 400 }
    )
  }

  if (type === 'dynamic' && (!parentField || !parentValue)) {
    return NextResponse.json(
      { error: 'Для динамического фильтра нужно указать parentField и parentValue' },
      { status: 400 }
    )
  }

  const config = await prisma.filterConfig.create({
    data: {
      categorySlug: categorySlug.trim(),
      filterField: filterField.trim(),
      title: title.trim(),
      type: type.trim(),
      parentField: parentField?.trim() || null,
      parentValue: parentValue?.trim() || null,
      sortOrder: parseInt(sortOrder) || 0,
    },
  })

  return NextResponse.json(config, { status: 201 })
}