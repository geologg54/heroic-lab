// app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || undefined

  // Параметры сортировки
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const order = searchParams.get('order') || 'desc'

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { article: { contains: search } }
    ]
  }
  if (category) {
    where.category = { slug: category }
  }

  // Формируем объект сортировки
  let orderBy: any = {}
  switch (sortBy) {
    case 'price':
      orderBy = { price: order }
      break
    case 'article':
      orderBy = { article: order }
      break
    case 'category':
      orderBy = { category: { name: order } }
      break
    case 'name':
      orderBy = { name: order }
      break
    default:
      orderBy = { createdAt: 'desc' }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ])

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  })
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const data = await request.json()
  const { article, name, price, oldPrice, description, images, categoryId, gameSystem, scale, type, faction, fileFormat, tags, inStock, featured } = data

  if (!article || !name || !price || !categoryId) {
    return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 })
  }

  const existing = await prisma.product.findUnique({ where: { article } })
  if (existing) {
    return NextResponse.json({ error: 'Товар с таким артикулом уже существует' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      article,
      name,
      searchName: name.toLowerCase(),
      price: parseInt(price),
      oldPrice: oldPrice ? parseInt(oldPrice) : null,
      description: description || '',
      images: Array.isArray(images) ? images.join(',') : images || '',
      categoryId,
      gameSystem: gameSystem || '',
      scale: scale || '32mm',
      type: type || 'unknown',
      faction: faction || null,
      fileFormat: fileFormat || 'STL',
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      featured: featured ?? false
    },
    include: { category: true }
  })

  return NextResponse.json(product, { status: 201 })
}