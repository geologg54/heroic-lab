// app/api/filter-config/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category')

  try {
    const where: any = {}
    if (categorySlug) {
      where.categorySlug = categorySlug
    }

    const configs = await prisma.filterConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error('Ошибка получения конфигурации фильтров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}