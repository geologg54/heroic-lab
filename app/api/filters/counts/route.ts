// app/api/filters/counts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      categories = [],
      filter1 = [], filter2 = [], filter3 = [], filter4 = [], filter5 = [],
      filter6 = [], filter7 = [], filter8 = [], filter9 = [], filter10 = [],
      filter11 = [], filter12 = [], filter13 = [], filter14 = [], filter15 = [],
      scales = [], tags = [], onSale = false,
    } = body

    // Базовый фильтр
    const where: any = {}
    if (categories.length) {
      where.category = { slug: { in: categories } }
    }
    if (onSale) {
      where.oldPrice = { not: null }
    }

    // Загружаем все товары, подходящие под базовые фильтры
    const products = await prisma.product.findMany({
      where,
      select: {
        filter1: true, filter2: true, filter3: true, filter4: true, filter5: true,
        filter6: true, filter7: true, filter8: true, filter9: true, filter10: true,
        filter11: true, filter12: true, filter13: true, filter14: true, filter15: true,
        scale: true, tags: true,
        category: { select: { slug: true } }
      }
    })

    // Функция для извлечения уникальных значений из поля
    const extractUnique = (values: (string | null)[]): string[] => {
      const set = new Set<string>()
      values.forEach(v => {
        if (v) {
          v.split(',').map(s => s.trim()).filter(Boolean).forEach(s => set.add(s))
        }
      })
      return Array.from(set).sort()
    }

    // Получаем все возможные значения для каждого поля (без учёта текущих фильтров, только базовые)
    const allValues: Record<string, string[]> = {
      categories: extractUnique(products.map(p => p.category.slug)),
    }
    for (let i = 1; i <= 15; i++) {
      allValues[`filter${i}`] = extractUnique(products.map(p => (p as any)[`filter${i}`] || null))
    }
    allValues.scales = extractUnique(products.map(p => p.scale))
    allValues.tags = extractUnique(products.map(p => p.tags))

    // Текущие выбранные фильтры (исключая поле, для которого считаем)
    const currentFilters: Record<string, string[]> = {
      categories,
      filter1, filter2, filter3, filter4, filter5,
      filter6, filter7, filter8, filter9, filter10,
      filter11, filter12, filter13, filter14, filter15,
      scales, tags
    }

    // Проверка, соответствует ли товар всем фильтрам (кроме исключённого поля)
    const matchesFilters = (product: any, filters: Record<string, string[]>, excludeField?: string, excludeValue?: string): boolean => {
      for (const [field, values] of Object.entries(filters)) {
        if (!values.length) continue
        if (excludeField === field && excludeValue && values.includes(excludeValue)) continue
        if (field === 'categories') {
          if (!values.includes(product.category.slug)) return false
        } else if (field === 'scales') {
          const productScales = product.scale ? product.scale.split(',').map((v: string) => v.trim()) : []
          if (!values.some(v => productScales.includes(v))) return false
        } else if (field === 'tags') {
          const productTags = product.tags ? product.tags.split(',').map((v: string) => v.trim()) : []
          if (!values.some(v => productTags.includes(v))) return false
        } else if (field.startsWith('filter')) {
          const productVal = (product as any)[field] || ''
          const productVals = productVal.split(',').map((v: string) => v.trim())
          if (!values.some(v => productVals.includes(v))) return false
        }
      }
      return true
    }

    // Считаем количество для каждого значения
    const counts: Record<string, Record<string, number>> = {}
    for (const [field, values] of Object.entries(allValues)) {
      const fieldCounts: Record<string, number> = {}
      for (const value of values) {
        let cnt = 0
        for (const product of products) {
          if (!matchesFilters(product, currentFilters, field, value)) continue
          // Проверяем, имеет ли товар это значение в данном поле
          if (field === 'categories') {
            if (product.category.slug === value) cnt++
          } else if (field === 'scales') {
            const productScales = product.scale ? product.scale.split(',').map((v: string) => v.trim()) : []
            if (productScales.includes(value)) cnt++
          } else if (field === 'tags') {
            const productTags = product.tags ? product.tags.split(',').map((v: string) => v.trim()) : []
            if (productTags.includes(value)) cnt++
          } else if (field.startsWith('filter')) {
            const productVal = (product as any)[field] || ''
            const productVals = productVal.split(',').map((v: string) => v.trim())
            if (productVals.includes(value)) cnt++
          }
        }
        if (cnt > 0) fieldCounts[value] = cnt
      }
      counts[field] = fieldCounts
    }

    return NextResponse.json(counts)
  } catch (error) {
    console.error('Ошибка в /api/filters/counts:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}