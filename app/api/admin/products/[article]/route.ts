// app/api/admin/products/[article]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ article: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { article } = await params
  const product = await prisma.product.findUnique({
    where: { article },
    include: { category: true }
  })

  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ article: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { article } = await params
  const data = await request.json()

  // ========== ВАЛИДАЦИЯ (как при создании, но article не меняем) ==========
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.length > 200) {
      return NextResponse.json({ error: 'Название товара должно быть от 1 до 200 символов' }, { status: 400 })
    }
  }
  if (data.price !== undefined) {
    const price = parseInt(data.price)
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Цена должна быть числом >= 0' }, { status: 400 })
    }
  }
  if (data.stock !== undefined) {
    const stock = parseInt(data.stock)
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: 'Количество должно быть числом >= 0' }, { status: 400 })
    }
  }
  if (data.description && typeof data.description === 'string' && data.description.length > 5000) {
    return NextResponse.json({ error: 'Описание не должно превышать 5000 символов' }, { status: 400 })
  }

  // Собираем объект обновления только с теми полями, которые переданы
  const updateData: any = {}

  if (data.name !== undefined) {
    updateData.name = data.name.trim()
    updateData.searchName = data.name.trim().toLowerCase()
  }
  if (data.price !== undefined) {
    updateData.price = parseInt(data.price)
  }
  if (data.oldPrice !== undefined) {
    updateData.oldPrice = data.oldPrice ? parseInt(data.oldPrice) : null
  }
  if (data.description !== undefined) {
    updateData.description = data.description
  }
  if (data.images !== undefined) {
    updateData.images = Array.isArray(data.images) ? data.images.join(',') : data.images
  }
  if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId
  }
  if (data.filter1 !== undefined) updateData.filter1 = data.filter1 || null
  if (data.filter2 !== undefined) updateData.filter2 = data.filter2 || null
  if (data.filter3 !== undefined) updateData.filter3 = data.filter3 || null
  if (data.filter4 !== undefined) updateData.filter4 = data.filter4 || null
  if (data.filter5 !== undefined) updateData.filter5 = data.filter5 || null
  if (data.stock !== undefined) updateData.stock = parseInt(data.stock)
  if (data.heightMax !== undefined) updateData.heightMax = data.heightMax ? parseFloat(data.heightMax) : null
  if (data.baseMax !== undefined) updateData.baseMax = data.baseMax ? parseFloat(data.baseMax) : null
  if (data.heightMin !== undefined) updateData.heightMin = data.heightMin ? parseFloat(data.heightMin) : null
  if (data.baseMin !== undefined) updateData.baseMin = data.baseMin ? parseFloat(data.baseMin) : null
  if (data.assembly !== undefined) updateData.assembly = data.assembly || null
  if (data.contents !== undefined) updateData.contents = data.contents || null
  if (data.artist !== undefined) updateData.artist = data.artist || null
  if (data.scale !== undefined) updateData.scale = data.scale
  if (data.tags !== undefined) {
    updateData.tags = Array.isArray(data.tags) ? data.tags.join(',') : data.tags
  }

  const product = await prisma.product.update({
    where: { article },
    data: updateData,
    include: { category: true },
  })

  return NextResponse.json(product)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ article: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { article } = await params
  await prisma.product.delete({ where: { article } })
  return NextResponse.json({ success: true })
}