// hooks/useApplyFilters.ts
import { useCallback } from 'react'
import type { Product } from '@/types'
import type { FilterState } from '@/components/catalog/FilterPanel'

interface UseApplyFiltersParams {
  products: Product[]
  filters: FilterState
  priceMax: number
}

/**
 * Хук возвращает функцию, которая фильтрует массив товаров
 * по активным фильтрам и максимальной цене.
 */
export function useApplyFilters({ products, filters, priceMax }: UseApplyFiltersParams) {
  const applyFilters = useCallback(() => {
    let filtered = [...products]

    // 1. Категории
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) => {
        const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
        return filters.categories.includes(catSlug)
      })
    }

    // Вспомогательная проверка: есть ли хоть одно совпадение в массивах
    const hasAny = (productValues: string[], selected: string[]) =>
      selected.some((sel) => productValues.includes(sel))

    // 2. Фильтры, зависящие от категории (если выбрано несколько категорий)
    if (filters.categories.length > 1 && filters.categoryFilters) {
      filtered = filtered.filter((p) => {
        const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
        const catFilter = filters.categoryFilters?.[catSlug]
        if (!catFilter) return true

        const checks: boolean[] = []

        if (catFilter.filter1?.length) {
          const vals = (p.filter1 || '').split(',').map((s) => s.trim())
          checks.push(hasAny(vals, catFilter.filter1!))
        }
        if (catFilter.filter2?.length) {
          const vals = (p.filter2 || '').split(',').map((s) => s.trim())
          checks.push(hasAny(vals, catFilter.filter2!))
        }
        if (catFilter.filter3?.length) {
          const vals = (p.filter3 || '').split(',').map((s) => s.trim())
          checks.push(hasAny(vals, catFilter.filter3!))
        }
        if (catFilter.filter4?.length) {
          const vals = (p.filter4 || '').split(',').map((s) => s.trim())
          checks.push(hasAny(vals, catFilter.filter4!))
        }
        if (catFilter.filter5?.length) {
          const vals = (p.filter5 || '').split(',').map((s) => s.trim())
          checks.push(hasAny(vals, catFilter.filter5!))
        }
        if (catFilter.scales?.length) {
          const vals = (p.scale || '').split(',').map((s) => s.trim())
          checks.push(hasAny(vals, catFilter.scales!))
        }

        // Если нет ни одного условия, пропускаем товар
        return checks.length === 0 || checks.every(Boolean)
      })
    } else {
      // 3. Обычные фильтры (одна категория или нет)
      if (filters.filter1.length > 0) {
        filtered = filtered.filter((p) => {
          const vals = (p.filter1 || '').split(',').map((s) => s.trim())
          return hasAny(vals, filters.filter1)
        })
      }
      if (filters.filter2.length > 0) {
        filtered = filtered.filter((p) => {
          const vals = (p.filter2 || '').split(',').map((s) => s.trim())
          return hasAny(vals, filters.filter2)
        })
      }
      if (filters.filter3.length > 0) {
        filtered = filtered.filter((p) => {
          const vals = (p.filter3 || '').split(',').map((s) => s.trim())
          return hasAny(vals, filters.filter3)
        })
      }
      if (filters.filter4.length > 0) {
        filtered = filtered.filter((p) => {
          const vals = (p.filter4 || '').split(',').map((s) => s.trim())
          return hasAny(vals, filters.filter4)
        })
      }
      if (filters.filter5.length > 0) {
        filtered = filtered.filter((p) => {
          const vals = (p.filter5 || '').split(',').map((s) => s.trim())
          return hasAny(vals, filters.filter5)
        })
      }
      if (filters.scales.length > 0) {
        filtered = filtered.filter((p) => {
          const vals = (p.scale || '').split(',').map((s) => s.trim())
          return hasAny(vals, filters.scales)
        })
      }
    }

    // 4. Теги
    if (filters.tags.length > 0) {
      filtered = filtered.filter((p) => hasAny(p.tags, filters.tags))
    }

    // 5. Цена
    filtered = filtered.filter((p) => p.price <= priceMax)

    return { filtered, activeFilters: filters }
  }, [products, filters, priceMax])

  return applyFilters
}