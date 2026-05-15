// hooks/useCatalogPage.ts
import { useState, useEffect, useCallback } from 'react'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import { useCatalogProducts } from '@/hooks/useCatalogProducts'
import type { FilterState } from '@/components/catalog/FilterPanel'

interface UseCatalogPageParams {
  initialFilters: FilterState
  initialPage: number
  initialShowOnlySale: boolean
  globalMinPrice: number
  globalMaxPrice: number
  categoriesData: any[]
  categoryNames: Record<string, string>
  staticFilterOptions: any
}

export function useCatalogPage({
  initialFilters,
  initialPage,
  initialShowOnlySale,
  globalMinPrice,
  globalMaxPrice,
  categoriesData,
  categoryNames,
}: UseCatalogPageParams) {
  const {
    filters, setFilters, toggleFilter, resetFilters,
    activeFiltersCount,
    filterConfigSections,
    categoryCounts, filterCounts, tagCounts,
  } = useCatalogFilters(initialFilters, categoriesData, categoryNames)

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

  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(initialPage)
  const [showOnlySale, setShowOnlySale] = useState(initialShowOnlySale)

  const { products, total, totalPages, loading } = useCatalogProducts({
    page, sortBy, currentMin, currentMax,
    globalMinPrice, globalMaxPrice, showOnlySale, filters,
  })

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

  const handleFilterPanelChange = useCallback((_filteredProducts: any[], newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }, [setFilters])

  const mobileSections: any[] = []
  const handleMobileSectionToggle = useCallback(() => {}, [])
  const applyMobileFilters = useCallback(() => setPage(1), [])

  return {
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
    filterConfigSections,
    categoryCounts,
    filterCounts,
    mobileSections,
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