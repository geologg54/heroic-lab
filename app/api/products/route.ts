// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit

  // 👇 Теперь берём ВСЕ выбранные категории
  const categorySlugs = searchParams.getAll('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'default'
  
  const articlesParam = searchParams.get('articles')

  // Старые глобальные фильтры (используются при одной категории)
  const filter1Vals = searchParams.getAll('filter1')
  const filter2Vals = searchParams.getAll('filter2')
  const filter3Vals = searchParams.getAll('filter3')
  const filter4Vals = searchParams.getAll('filter4')
  const filter5Vals = searchParams.getAll('filter5')
  const tagsVals = searchParams.getAll('tags')
  const scalesVals = searchParams.getAll('scale')

  // ---------- 1. Базовый where ----------
  const where: any = {}

  if (articlesParam) {
    const articles = articlesParam.split(',').map(a => a.trim()).filter(Boolean)
    if (articles.length > 0) {
      where.article = { in: articles }
    }
  }

  // 👇 Исправлено: фильтр по массиву категорий
  if (categorySlugs.length > 0) {
    where.category = { slug: { in: categorySlugs } }
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseInt(minPrice)
    if (maxPrice) where.price.lte = parseInt(maxPrice)
  }
  
  if (search) {
    where.searchName = { contains: search.toLowerCase() }
  }

  // ---------- 2. Сортировка ----------
  let orderBy: any = {}
  switch (sort) {
    case 'price-asc': orderBy = { price: 'asc' }; break
    case 'price-desc': orderBy = { price: 'desc' }; break
    case 'name': orderBy = { name: 'asc' }; break
    case 'newest': orderBy = { createdAt: 'desc' }; break
    default: orderBy = { createdAt: 'desc' }
  }

  try {
    const shouldPaginate = !articlesParam
    
    // Получаем ВСЕ товары по базовым условиям
    const baseProducts = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
    })

    // Преобразуем строки в массивы
    const productsWithArrays = baseProducts.map(p => ({
      ...p,
      tagsArray: p.tags.split(',').map(t => t.trim()).filter(Boolean),
      filter1Array: (p.filter1 || '').split(',').map(s => s.trim()).filter(Boolean),
      filter2Array: (p.filter2 || '').split(',').map(s => s.trim()).filter(Boolean),
      filter3Array: (p.filter3 || '').split(',').map(s => s.trim()).filter(Boolean),
      filter4Array: (p.filter4 || '').split(',').map(s => s.trim()).filter(Boolean),
      filter5Array: (p.filter5 || '').split(',').map(s => s.trim()).filter(Boolean),
      scalesArray: (p.scale || '').split(',').map(s => s.trim()).filter(Boolean),
    }))

    const hasAny = (productArray: string[], selected: string[]) => {
      if (selected.length === 0) return true
      return selected.some(val => productArray.includes(val))
    }

    // ----- Обработка фильтров, привязанных к категориям (categoryFilters) -----
    const categoryFiltersMap: Record<string, Record<string, string[]>> = {}
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('cat_')) {
        const parts = key.split('_')
        if (parts.length === 3) {
          const slug = parts[1]
          const field = parts[2]
          if (!categoryFiltersMap[slug]) categoryFiltersMap[slug] = {}
          if (!categoryFiltersMap[slug][field]) categoryFiltersMap[slug][field] = []
          categoryFiltersMap[slug][field].push(value)
        }
      }
    }

    let filteredProducts = productsWithArrays

    // Применяем фильтры в разрезе категорий, если они заданы
    if (Object.keys(categoryFiltersMap).length > 0) {
      filteredProducts = filteredProducts.filter(p => {
        const catSlug = p.category.slug
        const catFilters = categoryFiltersMap[catSlug]
        if (!catFilters) return true // для этой категории нет дополнительных фильтров

        const checks = []
        if (catFilters.filter1) checks.push(hasAny(p.filter1Array, catFilters.filter1))
        if (catFilters.filter2) checks.push(hasAny(p.filter2Array, catFilters.filter2))
        if (catFilters.filter3) checks.push(hasAny(p.filter3Array, catFilters.filter3))
        if (catFilters.filter4) checks.push(hasAny(p.filter4Array, catFilters.filter4))
        if (catFilters.filter5) checks.push(hasAny(p.filter5Array, catFilters.filter5))
        if (catFilters.scale) checks.push(hasAny(p.scalesArray, catFilters.scale))
        return checks.every(Boolean)
      })
    } else {
      // Нет categoryFilters — используем глобальные фильтры (старое поведение)
      filteredProducts = filteredProducts.filter(p => {
        return hasAny(p.filter1Array, filter1Vals) &&
               hasAny(p.filter2Array, filter2Vals) &&
               hasAny(p.filter3Array, filter3Vals) &&
               hasAny(p.filter4Array, filter4Vals) &&
               hasAny(p.filter5Array, filter5Vals) &&
               hasAny(p.scalesArray, scalesVals)
      })
    }

    // Теги применяются глобально
    if (tagsVals.length > 0) {
      filteredProducts = filteredProducts.filter(p => hasAny(p.tagsArray, tagsVals))
    }

    // Доступные фильтры (на основе всех товаров до пагинации)
    const productsForAvailable = productsWithArrays
    const availableFilters = {
      categories: [...new Set(productsForAvailable.map(p => p.category.slug))],
      filter1: [...new Set(productsForAvailable.flatMap(p => p.filter1Array))],
      filter2: [...new Set(productsForAvailable.flatMap(p => p.filter2Array))],
      filter3: [...new Set(productsForAvailable.flatMap(p => p.filter3Array))],
      filter4: [...new Set(productsForAvailable.flatMap(p => p.filter4Array))],
      filter5: [...new Set(productsForAvailable.flatMap(p => p.filter5Array))],
      tags: [...new Set(productsForAvailable.flatMap(p => p.tagsArray))],
      scales: [...new Set(productsForAvailable.flatMap(p => p.scalesArray))],
    }

    // Пагинация
    const paginatedProducts = shouldPaginate
      ? filteredProducts.slice(skip, skip + limit)
      : filteredProducts

    const total = filteredProducts.length

    const formattedProducts = paginatedProducts.map(p => ({
      ...p,
      images: p.images.split(','),
      tags: p.tagsArray,
      image: p.images.split(',')[0] || '',
      categorySlug: p.category.slug,
      categoryName: p.category.name
    }))

    const headers = new Headers()
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

    return new NextResponse(
      JSON.stringify({
        products: formattedProducts,
        total,
        page: shouldPaginate ? page : 1,
        totalPages: shouldPaginate ? Math.ceil(total / limit) : 1,
        availableFilters,
      }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}