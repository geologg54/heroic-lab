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

  // 🆕 Множественные фильтры — получаем все значения для каждого ключа
  const filter1 = searchParams.getAll('filter1')
  const filter2 = searchParams.getAll('filter2')
  const filter3 = searchParams.getAll('filter3')
  const filter4 = searchParams.getAll('filter4')
  const filter5 = searchParams.getAll('filter5')
  const tags = searchParams.getAll('tags')
  const scales = searchParams.getAll('scale') // масштаб тоже может быть множественным

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
  
  // 🆕 Для каждого множественного фильтра добавляем условие "содержит любое из"
  if (filter1.length > 0) {
    where.OR = where.OR || []
    filter1.forEach(val => {
      where.OR.push({ filter1: { contains: val } })
    })
  }
  if (filter2.length > 0) {
    where.OR = where.OR || []
    filter2.forEach(val => {
      where.OR.push({ filter2: { contains: val } })
    })
  }
  if (filter3.length > 0) {
    where.OR = where.OR || []
    filter3.forEach(val => {
      where.OR.push({ filter3: { contains: val } })
    })
  }
  if (filter4.length > 0) {
    where.OR = where.OR || []
    filter4.forEach(val => {
      where.OR.push({ filter4: { contains: val } })
    })
  }
  if (filter5.length > 0) {
    where.OR = where.OR || []
    filter5.forEach(val => {
      where.OR.push({ filter5: { contains: val } })
    })
  }
  if (tags.length > 0) {
    where.OR = where.OR || []
    tags.forEach(val => {
      where.OR.push({ tags: { contains: val } })
    })
  }
  if (scales.length > 0) {
    where.OR = where.OR || []
    scales.forEach(val => {
      where.OR.push({ scale: { contains: val } })
    })
  }

  // Если есть несколько групп условий, нужно чтобы они применялись через AND
  // Но Prisma не умеет комбинировать несколько OR автоматически, поэтому
  // если мы добавили несколько OR-массивов, нужно их объединить через AND
  // Для простоты пока оставим как есть — каждый фильтр добавляет свои условия в общий OR.
  // Это значит, что товар будет найден, если соответствует хотя бы одному из выбранных значений в любом фильтре.
  // Если нужно строгое "И" между разными фильтрами, логику нужно усложнить.

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
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        ...(shouldPaginate ? { skip, take: limit } : {})
      }),
      prisma.product.count({ where })
    ])

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
        totalPages: shouldPaginate ? Math.ceil(total / limit) : 1
      }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}