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
  
  // 🆕 Новый параметр: список артикулов через запятую (для избранного)
  const articlesParam = searchParams.get('articles')

  // Множественные фильтры
  const gameSystems = searchParams.getAll('gameSystem')
  const scales = searchParams.getAll('scale')
  const types = searchParams.getAll('type')

  const where: any = {}

  // 🆕 Если передан список артикулов, фильтруем только по ним
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
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { article: { contains: search } }
    ]
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
    // Если запрошены конкретные артикулы, пагинацию не применяем (их обычно немного)
    const shouldPaginate = !articlesParam
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        // Если это запрос избранного, не используем skip/take — возвращаем всё
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

    return NextResponse.json({
      products: formattedProducts,
      total,
      page: shouldPaginate ? page : 1,
      totalPages: shouldPaginate ? Math.ceil(total / limit) : 1
    })
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}