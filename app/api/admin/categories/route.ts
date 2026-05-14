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
  const { 
    name, slug, image, parentId,
    filter1Name, filter2Name, filter3Name, filter4Name, filter5Name,
    filter6Name, filter7Name, filter8Name, filter9Name, filter10Name,
    filter11Name, filter12Name, filter13Name, filter14Name, filter15Name
  } = data

  if (!name || !slug) {
    return NextResponse.json({ error: 'Имя и slug обязательны' }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug уже существует' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { 
      name, slug, image, parentId,
      filter1Name, filter2Name, filter3Name, filter4Name, filter5Name,
      filter6Name, filter7Name, filter8Name, filter9Name, filter10Name,
      filter11Name, filter12Name, filter13Name, filter14Name, filter15Name
    }
  })

  return NextResponse.json(category, { status: 201 })
}