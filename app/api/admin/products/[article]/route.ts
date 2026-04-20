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

  const product = await prisma.product.update({
    where: { article },
    data: {
      name: data.name,
      ssearchName: data.name.toLowerCase(), 
      price: parseInt(data.price),
      oldPrice: data.oldPrice ? parseInt(data.oldPrice) : null,
      description: data.description || '',
      images: Array.isArray(data.images) ? data.images.join(',') : data.images,
      categoryId: data.categoryId,
      gameSystem: data.gameSystem,
      scale: data.scale,
      type: data.type,
      faction: data.faction,
      fileFormat: data.fileFormat,
      tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
      featured: data.featured
    },
    include: { category: true }
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