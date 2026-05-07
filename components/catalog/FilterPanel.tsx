// components/catalog/FilterPanel.tsx
'use client'

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Product } from '@/types'
import { SlidersHorizontal } from 'lucide-react'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import FilterSection from './FilterSection'
import MobileFilterModal from './MobileFilterModal'
import { useFilterSections } from '@/hooks/useFilterSections'
import { useApplyFilters } from '@/hooks/useApplyFilters'

// ====== ИНТЕРФЕЙСЫ (без изменений) ======
export interface FilterState {
  categories: string[]
  filter1: string[]
  filter2: string[]
  filter3: string[]
  filter4: string[]
  filter5: string[]
  tags: string[]
  scales: string[]
  gameSystems: string[]
  factions: string[]
  types: string[]
  fileFormats: string[]
  categoryFilters?: CategoryFilters
}

export interface CategoryFilters {
  [categorySlug: string]: {
    filter1?: string[]
    filter2?: string[]
    filter3?: string[]
    filter4?: string[]
    filter5?: string[]
    scales?: string[]
  }
}

interface CategoryWithFilters {
  slug: string
  filter1Name?: string | null
  filter2Name?: string | null
  filter3Name?: string | null
  filter4Name?: string | null
  filter5Name?: string | null
}

export interface CategoryFilterGroup {
  categorySlug: string
  categoryName: string
  filter1Name?: string | null
  filter2Name?: string | null
  filter3Name?: string | null
  filter4Name?: string | null
  filter5Name?: string | null
}

interface FilterPanelProps {
  products: Product[]
  onFilter: (filtered: Product[], activeFilters: FilterState) => void
  hidePriceSlider?: boolean
  hideMobileButton?: boolean
  filterNames?: {
    filter1Name?: string | null
    filter2Name?: string | null
    filter3Name?: string | null
    filter4Name?: string | null
    filter5Name?: string | null
  } | null
  allCategories?: string[]
  allFilterOptions?: {
    categories: string[]
    filter1: string[]
    filter2: string[]
    filter3: string[]
    filter4: string[]
    filter5: string[]
    scales: string[]
  }
  availableTags?: string[]
  categoryNames?: Record<string, string>
  activeFilters?: FilterState
  forceOpen?: boolean
  categoryFilterGroups?: CategoryFilterGroup[]
  categoriesData?: CategoryWithFilters[]
  categoryFilterOptions?: {
    [slug: string]: {
      filter1: string[]
      filter2: string[]
      filter3: string[]
      filter4: string[]
      filter5: string[]
      scales: string[]
    }
  }
  categoryFilterNames?: {
    [slug: string]: {
      filter1Name?: string | null
      filter2Name?: string | null
      filter3Name?: string | null
      filter4Name?: string | null
      filter5Name?: string | null
    }
  }
  showOnlySale?: boolean
  onToggleSale?: () => void
}

// ====== Компонент ======
const FilterPanel = forwardRef<any, FilterPanelProps>(
  (
    {
      products,
      onFilter,
      hidePriceSlider = false,
      hideMobileButton = false,
      filterNames,
      allCategories = [],
      allFilterOptions,
      availableTags = [],
      categoryNames = {},
      activeFilters: externalFilters,
      forceOpen = false,
      categoryFilterGroups = [],
      categoriesData = [],
      categoryFilterOptions,
      categoryFilterNames,
      showOnlySale = false,
      onToggleSale,
    },
    ref
  ) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filters, setFilters] = useState<FilterState>(() => {
      if (externalFilters) return externalFilters
      return {
        categories: [],
        filter1: [],
        filter2: [],
        filter3: [],
        filter4: [],
        filter5: [],
        tags: [],
        scales: [],
        gameSystems: [],
        factions: [],
        types: [],
        fileFormats: [],
        categoryFilters: {},
      }
    })
    const [priceMax, setPriceMax] = useState(3500)

    useEffect(() => {
      if (externalFilters) setFilters(externalFilters)
    }, [externalFilters])

    useEffect(() => {
      setIsModalOpen(forceOpen)
    }, [forceOpen])

    // Получение опций для конкретной секции
    const getSectionOptions = useCallback(
      (sectionKey: string, categorySlug?: string): string[] => {
        if (categorySlug && categoryFilterOptions && categoryFilterOptions[categorySlug]) {
          if (sectionKey.startsWith('filter')) {
            const field = sectionKey.split('_')[0] as keyof typeof categoryFilterOptions[string]
            return categoryFilterOptions[categorySlug][field] || []
          }
          if (sectionKey === 'scales') return categoryFilterOptions[categorySlug].scales || []
        }
        if (sectionKey === 'tags') return availableTags
        if (allFilterOptions) {
          return (allFilterOptions as any)[sectionKey] || []
        }
        return []
      },
      [availableTags, allFilterOptions, categoryFilterOptions]
    )

    // Переключение фильтра
    const toggleFilter = useCallback(
      (key: string, value: string, categorySlug?: string) => {
        setFilters((prev) => {
          if (prev.categories.length > 1 && categorySlug) {
            const currentCatFilters = prev.categoryFilters || {}
            const catFilter = currentCatFilters[categorySlug] || {}
            const field = key as keyof typeof catFilter
            let currentValues = catFilter[field]
            if (!Array.isArray(currentValues)) currentValues = []
            const newValues = currentValues.includes(value)
              ? currentValues.filter((v) => v !== value)
              : [...currentValues, value]
            return {
              ...prev,
              categoryFilters: {
                ...currentCatFilters,
                [categorySlug]: { ...catFilter, [field]: newValues },
              },
            }
          } else {
            const currentValues = (prev as any)[key] as string[] | undefined
            const arr = Array.isArray(currentValues) ? currentValues : []
            const newValues = arr.includes(value)
              ? arr.filter((v) => v !== value)
              : [...arr, value]
            return { ...prev, [key]: newValues }
          }
        })
      },
      []
    )

    const resetFilters = useCallback(() => {
      setFilters({
        categories: [],
        filter1: [],
        filter2: [],
        filter3: [],
        filter4: [],
        filter5: [],
        tags: [],
        scales: [],
        gameSystems: [],
        factions: [],
        types: [],
        fileFormats: [],
        categoryFilters: {},
      })
      setPriceMax(3500)
      if (showOnlySale && onToggleSale) onToggleSale()
    }, [showOnlySale, onToggleSale])

    useImperativeHandle(ref, () => ({ resetFilters }))

    // Хук фильтрации
    const applyFilters = useApplyFilters({ products, filters, priceMax })

    // При изменении фильтров или цены вызываем onFilter с результатом
    useEffect(() => {
      const result = applyFilters()
      onFilter(result.filtered, result.activeFilters)
    }, [applyFilters, onFilter])

    // Секции фильтров
    const sections = useFilterSections({
      filters,
      filterNames,
      categoryFilterGroups,
      categoryFilterNames,
      getSectionOptions,
    })

    const hasActiveFilters = Object.values(filters).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    )

    // Рендер секций (общий для десктопа и модалки)
    const renderSections = () => (
      <>
        {sections.map((section) => {
          const isMulti = filters.categories.length > 1 && !!section.categorySlug
          let selected: string[] = []
          if (isMulti) {
            const catFilter = filters.categoryFilters?.[section.categorySlug!] || {}
            const field = section.key.split('_')[0] as keyof typeof catFilter
            selected = catFilter[field] || []
          } else {
            if (section.key === 'tags') selected = filters.tags || []
            else if (section.key === 'scales') selected = filters.scales || []
            else if (section.key === 'categories') selected = filters.categories || []
            else {
              const val = (filters as any)[section.key]
              selected = Array.isArray(val) ? val : []
            }
          }
          const options =
            section.key === 'tags'
              ? availableTags
              : getSectionOptions(section.key.split('_')[0], section.categorySlug)

          return (
            <FilterSection
              key={section.key}
              sectionKey={section.key}
              title={section.title}
              options={options}
              selected={selected}
              onToggle={(value) =>
                toggleFilter(section.key.split('_')[0], value, section.categorySlug)
              }
              categorySlug={section.categorySlug}
              paginated={section.paginated}
            />
          )
        })}
      </>
    )

    return (
      <>
        {!hideMobileButton && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg mb-4"
          >
            <SlidersHorizontal size={18} /> Фильтры
          </button>
        )}

        {/* Десктоп */}
        <div className="hidden lg:block">
          <div className="space-y-4">
            {renderSections()}

            {onToggleSale && (
              <div className="pt-2">
                <button
                  onClick={onToggleSale}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                    showOnlySale
                      ? 'border border-white text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Акционная подборка
                </button>
              </div>
            )}

            {!hidePriceSlider && (
              <div className="pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Цена: до {priceMax} ₽</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3500}
                  step={10}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            )}

            {hasActiveFilters && (
              <div className="pt-2">
                <ActiveFilters
                  filters={filters}
                  onRemove={(key, value) => toggleFilter(key, value)}
                  onClearAll={resetFilters}
                  categoryNames={categoryNames}
                />
              </div>
            )}

            <button onClick={resetFilters} className="text-accent text-sm mt-2">
              Сбросить все фильтры
            </button>
          </div>
        </div>

        {/* Мобильная модалка */}
        <MobileFilterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onClearAll={resetFilters}
          onApply={() => setIsModalOpen(false)}
        >
          {renderSections()}

          {onToggleSale && (
            <div className="pt-2">
              <button
                onClick={onToggleSale}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                  showOnlySale
                    ? 'border border-white text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Акционная подборка
              </button>
            </div>
          )}

          {!hidePriceSlider && (
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Цена: до {priceMax} ₽</span>
              </div>
              <input
                type="range"
                min={0}
                max={3500}
                step={10}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          )}
        </MobileFilterModal>
      </>
    )
  }
)

FilterPanel.displayName = 'FilterPanel'
export { FilterPanel }