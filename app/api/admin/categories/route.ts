// app/api/admin/categories/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const categories = await prisma.category.findMany({
    include: { parent: true, children: true }
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const data = await request.json()
  const { name, slug, image, parentId } = data

  if (!name || !slug) {
    return NextResponse.json({ error: 'Имя и slug обязательны' }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug уже существует' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name, slug, image, parentId }
  })

  return NextResponse.json(category, { status: 201 })
}