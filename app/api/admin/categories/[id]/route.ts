// app/api/admin/categories/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const data = await request.json()
  const { name, slug, image, parentId } = data

  const category = await prisma.category.update({
    where: { id },
    data: { name, slug, image, parentId }
  })

  return NextResponse.json(category)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const productsCount = await prisma.product.count({ where: { categoryId: id } })
  if (productsCount > 0) {
    return NextResponse.json({ error: 'Cannot delete category with products' }, { status: 400 })
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}