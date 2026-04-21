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
  
  const {
    article, name, price, oldPrice, description, images, categoryId,
    filter1, filter2, filter3, filter4, filter5,
    stock, heightMax, baseMax, heightMin, baseMin,
    assembly, contents, artist, scale, tags
  } = data

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
      filter1: filter1 || null,
      filter2: filter2 || null,
      filter3: filter3 || null,
      filter4: filter4 || null,
      filter5: filter5 || null,
      stock: stock !== undefined ? parseInt(stock) : 0,
      heightMax: heightMax ? parseFloat(heightMax) : null,
      baseMax: baseMax ? parseFloat(baseMax) : null,
      heightMin: heightMin ? parseFloat(heightMin) : null,
      baseMin: baseMin ? parseFloat(baseMin) : null,
      assembly: assembly || null,
      contents: contents || null,
      artist: artist || null,
      scale: scale || '32mm',
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
    },
    include: { category: true }
  })

  return NextResponse.json(product, { status: 201 })
}