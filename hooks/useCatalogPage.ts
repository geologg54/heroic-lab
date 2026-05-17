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

  const [dynamicFilterCounts, setDynamicFilterCounts] = useState<Record<string, Record<string, number>>>({})

  const fetchDynamicCounts = useCallback(async (currentFilters: FilterState, showOnlySale: boolean) => {
    try {
      const payload: any = {
        categories: currentFilters.categories,
        filter1: currentFilters.filter1,
        filter2: currentFilters.filter2,
        filter3: currentFilters.filter3,
        filter4: currentFilters.filter4,
        filter5: currentFilters.filter5,
        filter6: currentFilters.filter6,
        filter7: currentFilters.filter7,
        filter8: currentFilters.filter8,
        filter9: currentFilters.filter9,
        filter10: currentFilters.filter10,
        filter11: currentFilters.filter11,
        filter12: currentFilters.filter12,
        filter13: currentFilters.filter13,
        filter14: currentFilters.filter14,
        filter15: currentFilters.filter15,
        scales: currentFilters.scales,
        tags: currentFilters.tags,
        onSale: showOnlySale,
      }
      const res = await fetch('/api/filters/counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        setDynamicFilterCounts(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки динамических счётчиков:', error)
    }
  }, [])

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

  useEffect(() => {
    fetchDynamicCounts(filters, showOnlySale)
  }, [filters, showOnlySale, fetchDynamicCounts])

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

  const finalFilterCounts = Object.keys(dynamicFilterCounts).length ? dynamicFilterCounts : filterCounts

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
    filterCounts: finalFilterCounts,
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