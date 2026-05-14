// app/api/admin/categories/[id]/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { id } = await params
  const data = await request.json()
  const {
    name, slug, image, parentId,
    filter1Name, filter2Name, filter3Name, filter4Name, filter5Name,
    filter6Name, filter7Name, filter8Name, filter9Name, filter10Name,
    filter11Name, filter12Name, filter13Name, filter14Name, filter15Name
  } = data

  const category = await prisma.category.update({
    where: { id },
    data: {
      name, slug, image, parentId,
      filter1Name, filter2Name, filter3Name, filter4Name, filter5Name,
      filter6Name, filter7Name, filter8Name, filter9Name, filter10Name,
      filter11Name, filter12Name, filter13Name, filter14Name, filter15Name
    }
  })

  return NextResponse.json(category)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { id } = await params

  const productsCount = await prisma.product.count({
    where: { categoryId: id }
  })

  if (productsCount > 0) {
    return NextResponse.json(
      { error: 'Нельзя удалить категорию, в которой есть товары. Сначала переместите или удалите товары.' },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}