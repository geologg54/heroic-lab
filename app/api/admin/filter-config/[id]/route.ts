// app/api/admin/filter-config/[id]/route.ts
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

  const config = await prisma.filterConfig.update({
    where: { id },
    data: {
      categorySlug: data.categorySlug?.trim(),
      filterField: data.filterField?.trim(),
      title: data.title?.trim(),
      type: data.type?.trim(),
      parentField: data.parentField?.trim() || null,
      parentValue: data.parentValue?.trim() || null,
      sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder) : undefined,
    },
  })

  return NextResponse.json(config)
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
  await prisma.filterConfig.delete({ where: { id } })
  return NextResponse.json({ success: true })
}