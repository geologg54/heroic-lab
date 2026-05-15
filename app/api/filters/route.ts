// app/api/filters/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function extractUnique(items: string[]): string[] {
  const set = new Set<string>()
  items.forEach(item => {
    if (item) {
      item.split(',').map(s => s.trim()).filter(Boolean).forEach(s => set.add(s))
    }
  })
  return Array.from(set).sort()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlugs = searchParams.getAll('category')
  const separate = searchParams.get('separate') === 'true'
  const includeCounts = searchParams.get('includeCounts') === 'true' // не используется, оставлено для совместимости

  try {
    // Если нужно отдельно по категориям (для нескольких категорий)
    if (separate && categorySlugs.length > 1) {
      const categories = await prisma.category.findMany({
        where: { slug: { in: categorySlugs } },
        select: { id: true, slug: true }
      })

      const categoryFilters: Record<string, any> = {}
      for (const cat of categories) {
        const products = await prisma.product.findMany({
          where: { categoryId: cat.id },
          select: {
            filter1: true, filter2: true, filter3: true, filter4: true, filter5: true,
            filter6: true, filter7: true, filter8: true, filter9: true, filter10: true,
            filter11: true, filter12: true, filter13: true, filter14: true, filter15: true,
            scale: true
          }
        })
        const filters: any = {}
        for (let i = 1; i <= 15; i++) {
          const field = `filter${i}`
          filters[field] = extractUnique(products.map(p => (p as any)[field] || ''))
        }
        filters.scales = extractUnique(products.map(p => p.scale || ''))
        categoryFilters[cat.slug] = filters
      }

      const allTags = await prisma.product.findMany({
        where: { categoryId: { in: categories.map(c => c.id) } },
        select: { tags: true }
      })
      const tags = extractUnique(allTags.map(p => p.tags || ''))

      return NextResponse.json({
        categories: categorySlugs,
        categoryFilters,
        tags,
      })
    }

    // Обычный режим (одна или ни одной категории)
    const where: any = {}
    if (categorySlugs.length > 0) {
      where.category = { slug: { in: categorySlugs } }
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        filter1: true, filter2: true, filter3: true, filter4: true, filter5: true,
        filter6: true, filter7: true, filter8: true, filter9: true, filter10: true,
        filter11: true, filter12: true, filter13: true, filter14: true, filter15: true,
        scale: true, tags: true,
      },
    })

    const result: any = { categories: categorySlugs }
    for (let i = 1; i <= 15; i++) {
      result[`filter${i}`] = extractUnique(products.map(p => (p as any)[`filter${i}`] || ''))
    }
    result.scales = extractUnique(products.map(p => p.scale || ''))
    result.tags = extractUnique(products.map(p => p.tags || ''))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Ошибка получения фильтров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}