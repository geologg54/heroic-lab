// app/api/filters/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Вытаскивает уникальные значения из массива строк, где элементы могут быть разделены запятыми.
 * Например: "фракция1, фракция2" -> ["фракция1", "фракция2"]
 */
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
  const separate = searchParams.get('separate') === 'true'   // новый флаг

  try {
    // ========== Режим «раздельные фильтры» (если выбрано несколько категорий) ==========
    if (separate && categorySlugs.length > 1) {
      // Получаем информацию о запрошенных категориях (названия фильтров)
      const categories = await prisma.category.findMany({
        where: { slug: { in: categorySlugs } },
        select: {
          id: true, slug: true,
          filter1Name: true, filter2Name: true, filter3Name: true,
          filter4Name: true, filter5Name: true
        }
      })

      const categoryFilters: Record<string, any> = {}   // { 'dnd': { filter1: [...], ... }, ... }
      const filterNames: Record<string, any> = {}       // { 'dnd': { filter1Name: 'Фракция', ... }, ... }

      // Для каждой категории собираем её собственные доступные значения фильтров
      for (const cat of categories) {
        const products = await prisma.product.findMany({
          where: { categoryId: cat.id },
          select: {
            filter1: true, filter2: true, filter3: true,
            filter4: true, filter5: true, scale: true
          }
        })

        categoryFilters[cat.slug] = {
          filter1: extractUnique(products.map(p => p.filter1 || '')),
          filter2: extractUnique(products.map(p => p.filter2 || '')),
          filter3: extractUnique(products.map(p => p.filter3 || '')),
          filter4: extractUnique(products.map(p => p.filter4 || '')),
          filter5: extractUnique(products.map(p => p.filter5 || '')),
          scales: extractUnique(products.map(p => p.scale || '')),
        }

        filterNames[cat.slug] = {
          filter1Name: cat.filter1Name,
          filter2Name: cat.filter2Name,
          filter3Name: cat.filter3Name,
          filter4Name: cat.filter4Name,
          filter5Name: cat.filter5Name,
        }
      }

      // Теги собираем общие для всех выбранных категорий (можно позже разделить)
      const allTags = await prisma.product.findMany({
        where: { categoryId: { in: categories.map(c => c.id) } },
        select: { tags: true }
      })
      const tags = extractUnique(allTags.map(p => p.tags || ''))

      return NextResponse.json({
        categories: categorySlugs,
        categoryFilters,
        filterNames,
        tags,
      })
    }

    // ========== Старая логика (одна категория или без separate) ==========
    const where: any = {}
    if (categorySlugs.length > 0) {
      where.category = { slug: { in: categorySlugs } }
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        filter1: true, filter2: true, filter3: true,
        filter4: true, filter5: true, scale: true, tags: true,
      },
    })

    const filter1 = extractUnique(products.map(p => p.filter1 || ''))
    const filter2 = extractUnique(products.map(p => p.filter2 || ''))
    const filter3 = extractUnique(products.map(p => p.filter3 || ''))
    const filter4 = extractUnique(products.map(p => p.filter4 || ''))
    const filter5 = extractUnique(products.map(p => p.filter5 || ''))
    const scales = extractUnique(products.map(p => p.scale || ''))
    const tags = extractUnique(products.map(p => p.tags || ''))

    let filterNames = null
    if (categorySlugs.length === 1) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlugs[0] },
        select: {
          filter1Name: true, filter2Name: true, filter3Name: true,
          filter4Name: true, filter5Name: true,
        },
      })
      if (category) {
        filterNames = { ...category }
      }
    }

    return NextResponse.json({
      categories: categorySlugs,
      filter1, filter2, filter3, filter4, filter5, scales, tags,
      filterNames,
    })
  } catch (error) {
    console.error('Ошибка получения фильтров:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}