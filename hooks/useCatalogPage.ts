// hooks/useCatalogPage.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import { useCatalogProducts } from '@/hooks/useCatalogProducts'
import type { FilterState, CategoryFilterGroup } from '@/components/catalog/FilterPanel'
import type { Product } from '@/types'
import type { StaticFilterOptions, CategoryWithFilters } from '@/hooks/useCatalogFilters'

interface MobileSectionItem {
  key: string
  title: string
  options: { value: string; label: string }[]
  selected: string[]
  categorySlug?: string
  paginated?: boolean
}

interface UseCatalogPageParams {
  initialFilters: FilterState
  initialPage: number
  initialShowOnlySale: boolean // добавили
  globalMinPrice: number
  globalMaxPrice: number
  categoriesData: CategoryWithFilters[]
  categoryNames: Record<string, string>
  staticFilterOptions: StaticFilterOptions
}

export function useCatalogPage({
  initialFilters,
  initialPage,
  initialShowOnlySale,
  globalMinPrice,
  globalMaxPrice,
  categoriesData,
  categoryNames,
  staticFilterOptions,
}: UseCatalogPageParams) {
  // --- Фильтры (из хука) ---
  const {
    filters, setFilters, toggleFilter, resetFilters, fetchStaticFilters,
    activeFiltersCount, availableTags, filterNames, categoryFilterGroups,
    categoryFilterOptions, categoryFilterNames,
  } = useCatalogFilters(initialFilters, categoriesData, categoryNames)

  // --- Цена ---
  const [minVal, setMinVal] = useState(globalMinPrice)
  const [maxVal, setMaxVal] = useState(globalMaxPrice)
  const [currentMin, setCurrentMin] = useState(globalMinPrice)
  const [currentMax, setCurrentMax] = useState(globalMaxPrice)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentMin(minVal)
      setCurrentMax(maxVal)
    }, 250)
    return () => clearTimeout(timer)
  }, [minVal, maxVal])

  // --- Сортировка и страница ---
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(initialPage)

  // --- Акционная подборка ---
  const [showOnlySale, setShowOnlySale] = useState(initialShowOnlySale)

  // --- Продукты (из хука) ---
  const { products, total, totalPages, loading } = useCatalogProducts({
    page, sortBy, currentMin, currentMax,
    globalMinPrice, globalMaxPrice, showOnlySale, filters,
  })

  // --- Первичная загрузка фильтров ---
  useEffect(() => {
    fetchStaticFilters()
  }, [])

  useEffect(() => {
    fetchStaticFilters(filters.categories)
  }, [filters.categories, fetchStaticFilters])

  // --- Обработчики ---
  const handleSortChange = useCallback((value: string) => setSortBy(value), [])
  const handlePageChange = useCallback((newPage: number) => setPage(newPage), [])
  const handlePageChangeWithScroll = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleClearAll = useCallback(() => {
    resetFilters()
    setMinVal(globalMinPrice)
    setMaxVal(globalMaxPrice)
    setPage(1)
    setShowOnlySale(false)
  }, [resetFilters, globalMinPrice, globalMaxPrice])

  const handleRemoveFilter = useCallback((key: keyof FilterState, value: string) => {
    toggleFilter(key, value)
    setPage(1)
  }, [toggleFilter])

  const handleToggleSale = useCallback(() => {
    setShowOnlySale(prev => !prev)
    setPage(1)
  }, [])

  const handleFilterPanelChange = useCallback((_filteredProducts: Product[], newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }, [setFilters])

  // --- Мобильные секции ---
  const mobileSections = useMemo<MobileSectionItem[]>(() => {
    const sections: MobileSectionItem[] = []

    // Категории
    sections.push({
      key: 'categories',
      title: 'Категория',
      options: Object.keys(categoryNames).map(slug => ({
        value: slug,
        label: categoryNames[slug]
      })),
      selected: filters.categories,
    })

    if (filters.categories.length > 0) {
      const multiCategory = filters.categories.length > 1 && categoryFilterGroups.length > 0
      if (multiCategory) {
        for (const group of categoryFilterGroups) {
          const opts = categoryFilterOptions[group.categorySlug]
          if (!opts) continue
          const names = categoryFilterNames[group.categorySlug] || {}

          const add = (field: 'filter1' | 'filter2' | 'filter3' | 'filter4' | 'filter5', nameKey: string) => {
            const arr = opts[field]
            if (arr && arr.length > 0) {
              sections.push({
                key: `${field}_${group.categorySlug}`,
                title: (names as any)[nameKey] || group[nameKey as keyof typeof group] || field,
                options: arr.map(v => ({ value: v, label: v })),
                selected: (filters.categoryFilters?.[group.categorySlug]?.[field] as string[]) || [],
                categorySlug: group.categorySlug,
              })
            }
          }
          add('filter1', 'filter1Name')
          add('filter2', 'filter2Name')
          add('filter3', 'filter3Name')
          add('filter4', 'filter4Name')
          add('filter5', 'filter5Name')

          const scales = opts.scales
          if (scales && scales.length >= 2) {
            sections.push({
              key: `scales_${group.categorySlug}`,
              title: 'Масштаб',
              options: scales.map(v => ({ value: v, label: v })),
              selected: (filters.categoryFilters?.[group.categorySlug]?.scales as string[]) || [],
              categorySlug: group.categorySlug,
            })
          }
        }
      } else {
        const addGlobal = (key: 'filter1' | 'filter2' | 'filter3' | 'filter4' | 'filter5', idx: number) => {
          const opts = staticFilterOptions[key] || []
          if (opts.length > 0) {
            const titleKey = `filter${idx}Name` as keyof typeof filterNames
            sections.push({
              key,
              title: (filterNames?.[titleKey] as string) || `Фильтр ${idx}`,
              options: opts.map(v => ({ value: v, label: v })),
              selected: filters[key] || [],
            })
          }
        }
        addGlobal('filter1', 1)
        addGlobal('filter2', 2)
        addGlobal('filter3', 3)
        addGlobal('filter4', 4)
        addGlobal('filter5', 5)

        const scales = staticFilterOptions.scales
        if (scales && scales.length >= 2) {
          sections.push({
            key: 'scales',
            title: 'Масштаб',
            options: scales.map(v => ({ value: v, label: v })),
            selected: filters.scales,
          })
        }
      }
    }

    // Теги
    sections.push({
      key: 'tags',
      title: 'Теги',
      options: availableTags.map(v => ({ value: v, label: v })),
      selected: filters.tags,
      paginated: true,
    })

    return sections
  }, [
    filters, categoryNames, staticFilterOptions, availableTags,
    categoryFilterGroups, categoryFilterOptions, categoryFilterNames, filterNames
  ])

  const handleMobileSectionToggle = useCallback((sectionKey: string, value: string) => {
    const section = mobileSections.find(s => s.key === sectionKey)
    toggleFilter(sectionKey, value, section?.categorySlug)
  }, [mobileSections, toggleFilter])

  const applyMobileFilters = useCallback(() => {
    setPage(1)
  }, [])

  return {
    // Состояния
    filters,
    products,
    total,
    totalPages,
    page,
    loading,
    activeFiltersCount,
    showOnlySale,
    minVal,
    maxVal,
    globalMinPrice,
    globalMaxPrice,
    staticFilterOptions,
    availableTags,
    filterNames,
    categoryFilterGroups,
    categoryFilterNames,
    categoryFilterOptions,
    mobileSections,
    sortBy,
    // Обработчики
    handleSortChange,
    handlePageChange,
    handlePageChangeWithScroll,
    handleClearAll,
    handleRemoveFilter,
    handleToggleSale,
    handleFilterPanelChange,
    handleMobileSectionToggle,
    applyMobileFilters,
    setMinVal,
    setMaxVal,
  }
}