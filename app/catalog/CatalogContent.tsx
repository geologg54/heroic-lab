// app/catalog/CatalogContent.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import { useCatalogProducts } from '@/hooks/useCatalogProducts'
import DesktopCatalog from '@/components/catalog/DesktopCatalog'
import MobileCatalog from '@/components/catalog/MobileCatalog'
import type { FilterState } from '@/components/catalog/FilterPanel'
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

interface CatalogContentProps {
  initialProducts: Product[]
  initialTotal: number
  initialPage: number
  totalPages: number
  categories: string[]
  allFilterOptions: StaticFilterOptions
  categoryNames: Record<string, string>
  categoriesData: CategoryWithFilters[]
  minPrice: number
  maxPrice: number
}

export default function CatalogContent(props: CatalogContentProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const searchParams = useSearchParams()

  // ----- Начальные фильтры из URL -----
  const getInitialFilters = (): FilterState => {
    const params = new URLSearchParams(searchParams.toString())
    return {
      categories: params.getAll('category'),
      filter1: params.getAll('filter1'),
      filter2: params.getAll('filter2'),
      filter3: params.getAll('filter3'),
      filter4: params.getAll('filter4'),
      filter5: params.getAll('filter5'),
      tags: params.getAll('tags'),
      scales: params.getAll('scale'),
      gameSystems: [],
      factions: [],
      types: [],
      fileFormats: [],
      categoryFilters: {},
    }
  }

  // ----- Хуки фильтров и товаров -----
  const {
    filters, setFilters, toggleFilter, resetFilters, fetchStaticFilters,
    activeFiltersCount, staticFilterOptions, availableTags,
    filterNames, categoryFilterGroups, categoryFilterOptions, categoryFilterNames,
  } = useCatalogFilters(getInitialFilters(), props.categoriesData, props.categoryNames)

  // ----- Цена -----
  const [minVal, setMinVal] = useState(props.minPrice)
  const [maxVal, setMaxVal] = useState(props.maxPrice)
  const [currentMin, setCurrentMin] = useState(props.minPrice)
  const [currentMax, setCurrentMax] = useState(props.maxPrice)

  // Задержка перед применением ползунков цены (уменьшена до 250 мс)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentMin(minVal)
      setCurrentMax(maxVal)
    }, 250) // было 500
    return () => clearTimeout(timer)
  }, [minVal, maxVal])

  // ----- Сортировка и страница -----
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(props.initialPage)

  // ----- Акционная подборка -----
  const [showOnlySale, setShowOnlySale] = useState(searchParams.get('onSale') === 'true')

  // ----- Загрузка товаров -----
  const { products, total, totalPages, loading } = useCatalogProducts({
    page, sortBy, currentMin, currentMax,
    globalMinPrice: props.minPrice,
    globalMaxPrice: props.maxPrice,
    showOnlySale,
    filters,
  })

  // ----- Первичная загрузка фильтров -----
  useEffect(() => {
    fetchStaticFilters()
  }, [])
  useEffect(() => {
    fetchStaticFilters(filters.categories)
  }, [filters.categories, fetchStaticFilters])

  // ----- Обработчики -----
  const handleSortChange = (value: string) => setSortBy(value)
  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageChangeWithScroll = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearAll = () => {
    resetFilters()
    setMinVal(props.minPrice)
    setMaxVal(props.maxPrice)
    setPage(1)
    setShowOnlySale(false)
  }

  const handleRemoveFilter = (key: keyof FilterState, value: string) => {
    toggleFilter(key, value)
    setPage(1)
  }

  const handleToggleSale = () => {
    setShowOnlySale(prev => !prev)
    setPage(1)
  }

  // ----- Приёмка фильтров от десктопного FilterPanel -----
  const handleFilterPanelChange = useCallback((_filteredProducts: Product[], newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }, [setFilters])

  // ----- Мобильные секции фильтров -----
  const mobileSections: MobileSectionItem[] = useMemo(() => {
    const sections: MobileSectionItem[] = []

    // Категории
    sections.push({
      key: 'categories',
      title: 'Категория',
      options: Object.keys(props.categoryNames).map(slug => ({
        value: slug,
        label: props.categoryNames[slug]
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
    filters, props.categoryNames, staticFilterOptions, availableTags,
    categoryFilterGroups, categoryFilterOptions, categoryFilterNames, filterNames
  ])

  const handleMobileSectionToggle = useCallback((sectionKey: string, value: string) => {
    const section = mobileSections.find(s => s.key === sectionKey)
    toggleFilter(sectionKey, value, section?.categorySlug)
  }, [mobileSections, toggleFilter])

  const applyMobileFilters = () => {
    setPage(1)
  }

  // ----- РЕНДЕР -----
  if (isMobile) {
    return (
      <MobileCatalog
        products={products}
        total={total}
        totalPages={totalPages}
        page={page}
        loading={loading}
        filters={filters}
        activeFiltersCount={activeFiltersCount}
        showOnlySale={showOnlySale}
        onToggleSale={handleToggleSale}
        onPageChange={handlePageChange}
        onPageChangeWithScroll={handlePageChangeWithScroll}
        onSortChange={handleSortChange}
        onApplyFilters={applyMobileFilters}
        onClearAll={handleClearAll}
        mobileSections={mobileSections}
        onSectionToggle={handleMobileSectionToggle}
        minVal={minVal}
        maxVal={maxVal}
        globalMinPrice={props.minPrice}
        globalMaxPrice={props.maxPrice}
        onMinChange={setMinVal}
        onMaxChange={setMaxVal}
        onPriceInputMin={(v) => { if (v >= props.minPrice && v <= maxVal) setMinVal(v) }}
        onPriceInputMax={(v) => { if (v <= props.maxPrice && v >= minVal) setMaxVal(v) }}
      />
    )
  }

  return (
    <DesktopCatalog
      products={products}
      total={total}
      totalPages={totalPages}
      page={page}
      loading={loading}
      filters={filters}
      onRemoveFilter={handleRemoveFilter}
      onClearAll={handleClearAll}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onPageChangeWithScroll={handlePageChangeWithScroll}
      allCategories={Object.keys(props.categoryNames)}
      staticFilterOptions={staticFilterOptions}
      availableTags={availableTags}
      filterNames={filterNames}
      categoryNames={props.categoryNames}
      categoryFilterGroups={categoryFilterGroups}
      categoriesData={props.categoriesData}
      categoryFilterOptions={categoryFilterOptions}
      categoryFilterNames={categoryFilterNames}
      showOnlySale={showOnlySale}
      onToggleSale={handleToggleSale}
      minVal={minVal}
      maxVal={maxVal}
      globalMinPrice={props.minPrice}
      globalMaxPrice={props.maxPrice}
      onMinChange={setMinVal}
      onMaxChange={setMaxVal}
      onPriceInputMin={(v) => { if (v >= props.minPrice && v <= maxVal) setMinVal(v) }}
      onPriceInputMax={(v) => { if (v <= props.maxPrice && v >= minVal) setMaxVal(v) }}
      onFilterChange={handleFilterPanelChange}
    />
  )
}