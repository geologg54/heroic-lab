// app/catalog/CatalogContent.tsx
'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCatalogPage } from '@/hooks/useCatalogPage'
import DesktopCatalog from '@/components/catalog/DesktopCatalog'
import MobileCatalog from '@/components/catalog/MobileCatalog'
import type { FilterState } from '@/components/catalog/FilterPanel'
import type { Product } from '@/types'

interface CatalogContentProps {
  initialProducts: Product[]
  initialTotal: number
  initialPage: number
  totalPages: number
  categories: string[]
  allFilterOptions: any
  categoryNames: Record<string, string>
  categoriesData: any[]
  minPrice: number
  maxPrice: number
}

export default function CatalogContent(props: CatalogContentProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const searchParams = useSearchParams()

  const getInitialFilters = (): FilterState => {
    const params = new URLSearchParams(searchParams.toString())
    return {
      categories: params.getAll('category'),
      filter1: params.getAll('filter1'),
      filter2: params.getAll('filter2'),
      filter3: params.getAll('filter3'),
      filter4: params.getAll('filter4'),
      filter5: params.getAll('filter5'),
      filter6: params.getAll('filter6'),
      filter7: params.getAll('filter7'),
      filter8: params.getAll('filter8'),
      filter9: params.getAll('filter9'),
      filter10: params.getAll('filter10'),
      filter11: params.getAll('filter11'),
      filter12: params.getAll('filter12'),
      filter13: params.getAll('filter13'),
      filter14: params.getAll('filter14'),
      filter15: params.getAll('filter15'),
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
    filterCounts: pageData.filterCounts,
  }

  if (isMobile) {
    return (
      <MobileCatalog
        {...commonProps}
        onApplyFilters={pageData.applyMobileFilters}
        mobileSections={pageData.mobileSections}
        onSectionToggle={pageData.handleMobileSectionToggle}
      />
    )
  }

  return (
    <DesktopCatalog
      {...commonProps}
      onRemoveFilter={pageData.handleRemoveFilter}
      allCategories={Object.keys(props.categoryNames)}
      categoryNames={props.categoryNames}
      filterConfigSections={pageData.filterConfigSections}
      onFilterChange={pageData.handleFilterPanelChange}
    />
  )
}