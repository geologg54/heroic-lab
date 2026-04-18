// app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || undefined

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

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
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
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await request.json()
  const { article, name, price, oldPrice, description, images, categoryId, gameSystem, scale, type, faction, fileFormat, tags, inStock, featured } = data

  if (!article || !name || !price || !categoryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.product.findUnique({ where: { article } })
  if (existing) {
    return NextResponse.json({ error: 'Product with this article already exists' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      article,
      name,
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