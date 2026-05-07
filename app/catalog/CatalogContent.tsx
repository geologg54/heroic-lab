// app/catalog/CatalogContent.tsx
'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCatalogPage } from '@/hooks/useCatalogPage'
import DesktopCatalogView from '@/components/catalog/DesktopCatalogView'
import MobileCatalogView from '@/components/catalog/MobileCatalogView'
import type { FilterState } from '@/components/catalog/FilterPanel'
import type { Product } from '@/types'
import type { StaticFilterOptions, CategoryWithFilters } from '@/hooks/useCatalogFilters'

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

  // Начальные фильтры из URL
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

  const initialFilters = useMemo(() => getInitialFilters(), [searchParams])

  const pageData = useCatalogPage({
    initialFilters,
    initialPage: props.initialPage,
    initialShowOnlySale: searchParams.get('onSale') === 'true',
    globalMinPrice: props.minPrice,
    globalMaxPrice: props.maxPrice,
    categoriesData: props.categoriesData,
    categoryNames: props.categoryNames,
    staticFilterOptions: props.allFilterOptions,
  })

  // Общие пропсы для обоих представлений
  const commonProps = {
    products: pageData.products,
    total: pageData.total,
    totalPages: pageData.totalPages,
    page: pageData.page,
    loading: pageData.loading,
    filters: pageData.filters,
    activeFiltersCount: pageData.activeFiltersCount,
    showOnlySale: pageData.showOnlySale,
    onToggleSale: pageData.handleToggleSale,
    onPageChange: pageData.handlePageChange,
    onPageChangeWithScroll: pageData.handlePageChangeWithScroll,
    onSortChange: pageData.handleSortChange,
    onClearAll: pageData.handleClearAll,
    minVal: pageData.minVal,
    maxVal: pageData.maxVal,
    globalMinPrice: pageData.globalMinPrice,
    globalMaxPrice: pageData.globalMaxPrice,
    onMinChange: pageData.setMinVal,
    onMaxChange: pageData.setMaxVal,
    onPriceInputMin: (v: number) => {
      if (v >= pageData.globalMinPrice && v <= pageData.maxVal) pageData.setMinVal(v)
    },
    onPriceInputMax: (v: number) => {
      if (v <= pageData.globalMaxPrice && v >= pageData.minVal) pageData.setMaxVal(v)
    },
  }

  if (isMobile) {
    return (
      <MobileCatalogView
        {...commonProps}
        onApplyFilters={pageData.applyMobileFilters}
        mobileSections={pageData.mobileSections}
        onSectionToggle={pageData.handleMobileSectionToggle}
      />
    )
  }

  return (
    <DesktopCatalogView
      {...commonProps}
      onRemoveFilter={pageData.handleRemoveFilter}
      allCategories={props.categories}
      staticFilterOptions={pageData.staticFilterOptions}
      availableTags={pageData.availableTags}
      filterNames={pageData.filterNames}
      categoryNames={props.categoryNames}
      categoryFilterGroups={pageData.categoryFilterGroups}
      categoriesData={props.categoriesData}
      categoryFilterOptions={pageData.categoryFilterOptions}
      categoryFilterNames={pageData.categoryFilterNames}
      onFilterChange={pageData.handleFilterPanelChange}
    />
  )
}