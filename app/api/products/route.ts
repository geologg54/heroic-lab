// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit

  const selectedCategories = searchParams.getAll('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'default'
  const articlesParam = searchParams.get('articles')
  const onSale = searchParams.get('onSale') === 'true'

  // Собираем выбранные значения фильтров
  const filterValues: Record<string, string[]> = {}
  for (let i = 1; i <= 15; i++) {
    const key = `filter${i}`
    filterValues[key] = searchParams.getAll(key)
  }
  const tagsVals = searchParams.getAll('tags')
  const scalesVals = searchParams.getAll('scale')

  const where: any = {}

  if (articlesParam) {
    const articles = articlesParam.split(',').map(a => a.trim()).filter(Boolean)
    if (articles.length > 0) where.article = { in: articles }
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseInt(minPrice)
    if (maxPrice) where.price.lte = parseInt(maxPrice)
  }
  if (search) where.searchName = { contains: search.toLowerCase() }
  if (onSale) where.oldPrice = { not: null }

  // --- ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ ---
  if (selectedCategories.length > 0) {
    where.category = { slug: { in: selectedCategories } }
  }

  // Сортировка
  let orderBy: any = {}
  switch (sort) {
    case 'price-asc': orderBy = { price: 'asc' }; break
    case 'price-desc': orderBy = { price: 'desc' }; break
    case 'name': orderBy = { name: 'asc' }; break
    case 'newest': orderBy = { createdAt: 'desc' }; break
    default: orderBy = { createdAt: 'desc' }
  }

  try {
    // Получаем ВСЕ товары, удовлетворяющие базовым условиям (категория, цена, поиск)
    // Фильтрацию по filter1..15 и т.д. будем делать в коде, потому что Prisma не умеет искать по подстроке в полях с разделителями.
    const allProducts = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
    })

    // Функция проверки, содержит ли строка с разделителями хотя бы одно из значений
    const hasAny = (fieldValue: string, selected: string[]): boolean => {
      if (!fieldValue || selected.length === 0) return false
      const values = fieldValue.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      return selected.some(sel => values.includes(sel.toLowerCase()))
    }

    // Фильтруем товары по выбранным значениям фильтров
    let filteredProducts = allProducts.filter(p => {
      // Проверяем каждый фильтр, для которого есть выбранные значения
      for (let i = 1; i <= 15; i++) {
        const key = `filter${i}`
        if (filterValues[key].length > 0) {
          if (!hasAny((p as any)[key] || '', filterValues[key])) {
            return false
          }
        }
      }
      // tags
      if (tagsVals.length > 0) {
        if (!hasAny(p.tags, tagsVals)) return false
      }
      // scales
      if (scalesVals.length > 0) {
        if (!hasAny(p.scale, scalesVals)) return false
      }
      return true
    })

    // Форматируем
    const formattedProducts = filteredProducts.map(p => ({
      ...p,
      images: p.images.split(','),
      tags: p.tags.split(',').map(t => t.trim()).filter(Boolean),
      image: p.images.split(',')[0] || '',
      categorySlug: p.category.slug,
      categoryName: p.category.name,
    }))

    const total = formattedProducts.length
    const shouldPaginate = !articlesParam
    const paginatedProducts = shouldPaginate
      ? formattedProducts.slice(skip, skip + limit)
      : formattedProducts

    return NextResponse.json({
      products: paginatedProducts,
      total,
      page: shouldPaginate ? page : 1,
      totalPages: shouldPaginate ? Math.ceil(total / limit) : 1,
    })
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}