// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit

  const categorySlug = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'default'
  
  const articlesParam = searchParams.get('articles')

  const filter1 = searchParams.getAll('filter1')
  const filter2 = searchParams.getAll('filter2')
  const filter3 = searchParams.getAll('filter3')
  const filter4 = searchParams.getAll('filter4')
  const filter5 = searchParams.getAll('filter5')
  const tags = searchParams.getAll('tags')
  const scales = searchParams.getAll('scale')

  const where: any = {}

  if (articlesParam) {
    const articles = articlesParam.split(',').map(a => a.trim()).filter(Boolean)
    if (articles.length > 0) {
      where.article = { in: articles }
    }
  }

  if (categorySlug) where.category = { slug: categorySlug }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseInt(minPrice)
    if (maxPrice) where.price.lte = parseInt(maxPrice)
  }
  
  if (search) {
    where.searchName = { contains: search.toLowerCase() }
  }
  
  const orConditions: any[] = []
  
  if (filter1.length > 0) filter1.forEach(val => orConditions.push({ filter1: { contains: val } }))
  if (filter2.length > 0) filter2.forEach(val => orConditions.push({ filter2: { contains: val } }))
  if (filter3.length > 0) filter3.forEach(val => orConditions.push({ filter3: { contains: val } }))
  if (filter4.length > 0) filter4.forEach(val => orConditions.push({ filter4: { contains: val } }))
  if (filter5.length > 0) filter5.forEach(val => orConditions.push({ filter5: { contains: val } }))
  if (tags.length > 0) tags.forEach(val => orConditions.push({ tags: { contains: val } }))
  if (scales.length > 0) scales.forEach(val => orConditions.push({ scale: { contains: val } }))
  
  if (orConditions.length > 0) {
    where.OR = orConditions
  }

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
    
    // Сначала получаем ВСЕ товары, удовлетворяющие фильтрам (без пагинации)
    // Это нужно для подсчёта availableFilters
    const allFilteredProducts = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      // Без skip и take – получаем все
    })

    // Вычисляем доступные значения фильтров на основе всех отфильтрованных товаров
    const availableFilters = {
      categories: [...new Set(allFilteredProducts.map(p => p.category.slug))],
      filter1: [...new Set(allFilteredProducts.flatMap(p => (p.filter1 || '').split(',').map(s => s.trim()).filter(Boolean)))],
      filter2: [...new Set(allFilteredProducts.flatMap(p => (p.filter2 || '').split(',').map(s => s.trim()).filter(Boolean)))],
      filter3: [...new Set(allFilteredProducts.flatMap(p => (p.filter3 || '').split(',').map(s => s.trim()).filter(Boolean)))],
      filter4: [...new Set(allFilteredProducts.flatMap(p => (p.filter4 || '').split(',').map(s => s.trim()).filter(Boolean)))],
      filter5: [...new Set(allFilteredProducts.flatMap(p => (p.filter5 || '').split(',').map(s => s.trim()).filter(Boolean)))],
      tags: [...new Set(allFilteredProducts.flatMap(p => p.tags.split(',').map(t => t.trim()).filter(Boolean)))],
      scales: [...new Set(allFilteredProducts.flatMap(p => (p.scale || '').split(',').map(s => s.trim()).filter(Boolean)))],
    }

    // Теперь получаем товары с пагинацией (если нужно)
    const products = shouldPaginate
      ? allFilteredProducts.slice(skip, skip + limit)
      : allFilteredProducts

    const total = allFilteredProducts.length

    const formattedProducts = products.map(p => ({
      ...p,
      images: p.images.split(','),
      tags: p.tags.split(','),
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
        availableFilters, // <-- НОВОЕ: добавляем в ответ
      }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}