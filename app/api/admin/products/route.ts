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

  // ========== ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ ==========
  // Артикул обязателен, непустой и не длиннее 50 символов
  if (!data.article || typeof data.article !== 'string' || data.article.trim().length === 0 || data.article.length > 50) {
    return NextResponse.json({ error: 'Артикул должен быть непустым и не длиннее 50 символов' }, { status: 400 })
  }

  // Название обязательно, до 200 символов
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.length > 200) {
    return NextResponse.json({ error: 'Название товара обязательно (до 200 символов)' }, { status: 400 })
  }

  // Цена: должна быть числом >= 0
  const price = parseInt(data.price)
  if (isNaN(price) || price < 0) {
    return NextResponse.json({ error: 'Цена должна быть положительным числом' }, { status: 400 })
  }

  // Категория обязательна
  if (!data.categoryId || typeof data.categoryId !== 'string') {
    return NextResponse.json({ error: 'Не указана категория товара' }, { status: 400 })
  }

  // Описание — если есть, ограничим длину
  if (data.description && typeof data.description === 'string' && data.description.length > 5000) {
    return NextResponse.json({ error: 'Описание не должно превышать 5000 символов' }, { status: 400 })
  }

  // Дополнительно можно проверить stock (число) и другие числовые поля
  const stock = data.stock !== undefined ? parseInt(data.stock) : 0
  if (isNaN(stock) || stock < 0) {
    return NextResponse.json({ error: 'Количество должно быть числом >= 0' }, { status: 400 })
  }

  // Проверяем, нет ли уже товара с таким артикулом
  const existing = await prisma.product.findUnique({ where: { article: data.article.trim() } })
  if (existing) {
    return NextResponse.json({ error: 'Товар с таким артикулом уже существует' }, { status: 400 })
  }

  // Формируем объект для создания
  const productData = {
    article: data.article.trim(),
    name: data.name.trim(),
    searchName: data.name.trim().toLowerCase(),
    price,
    oldPrice: data.oldPrice ? parseInt(data.oldPrice) || null : null,
    description: data.description || '',
    images: Array.isArray(data.images) ? data.images.join(',') : (data.images || ''),
    categoryId: data.categoryId,
    filter1: data.filter1 || null,
    filter2: data.filter2 || null,
    filter3: data.filter3 || null,
    filter4: data.filter4 || null,
    filter5: data.filter5 || null,
    stock,
    heightMax: data.heightMax ? parseFloat(data.heightMax) : null,
    baseMax: data.baseMax ? parseFloat(data.baseMax) : null,
    heightMin: data.heightMin ? parseFloat(data.heightMin) : null,
    baseMin: data.baseMin ? parseFloat(data.baseMin) : null,
    assembly: data.assembly || null,
    contents: data.contents || null,
    artist: data.artist || null,
    scale: data.scale || '32mm',
    tags: Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || ''),
  }

  const product = await prisma.product.create({
    data: productData,
    include: { category: true },
  })

  return NextResponse.json(product, { status: 201 })
}