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

  const gameSystems = searchParams.getAll('gameSystem')
  const scales = searchParams.getAll('scale')
  const types = searchParams.getAll('type')

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
  
  // Поиск по полю searchName (регистронезависимый)
  if (search) {
    where.searchName = { contains: search.toLowerCase() }
  }
  
  if (gameSystems.length) where.gameSystem = { in: gameSystems }
  if (scales.length) where.scale = { in: scales }
  if (types.length) where.type = { in: types }

  let orderBy: any = {}
  switch (sort) {
    case 'price-asc': orderBy = { price: 'asc' }; break
    case 'price-desc': orderBy = { price: 'desc' }; break
    case 'name': orderBy = { name: 'asc' }; break
    case 'newest': orderBy = { createdAt: 'desc' }; break
    case 'popularity': orderBy = { popularity: 'desc' }; break
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

    // === НАСТРОЙКИ КЕШИРОВАНИЯ ДЛЯ API ===
    // Устанавливаем заголовки, чтобы ответ кешировался на 60 секунд в CDN/браузере,
    // и ещё 300 секунд может отдаваться устаревший контент, пока в фоне генерируется свежий.
    const headers = new Headers()
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

    return new NextResponse(
      JSON.stringify({
        products: formattedProducts,
        total,
        page: shouldPaginate ? page : 1,
        totalPages: shouldPaginate ? Math.ceil(total / limit) : 1
      }),
      {
        status: 200,
        headers
      }
    )
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}