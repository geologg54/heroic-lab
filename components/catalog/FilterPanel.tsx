// components/catalog/FilterPanel.tsx
'use client'

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Product } from '@/types'
import { SlidersHorizontal } from 'lucide-react'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import FilterSection from './FilterSection'
import MobileFilterModal from './MobileFilterModal'

export interface FilterState {
  categories: string[]
  filter1: string[]; filter2: string[]; filter3: string[]; filter4: string[]; filter5: string[]
  filter6: string[]; filter7: string[]; filter8: string[]; filter9: string[]; filter10: string[]
  filter11: string[]; filter12: string[]; filter13: string[]; filter14: string[]; filter15: string[]
  scales: string[]
  tags: string[]
  gameSystems: string[]; factions: string[]; types: string[]; fileFormats: string[]
  categoryFilters?: CategoryFilters
}

export interface CategoryFilters {
  [categorySlug: string]: {
    filter1?: string[]; filter2?: string[]; filter3?: string[]; filter4?: string[]; filter5?: string[]
    filter6?: string[]; filter7?: string[]; filter8?: string[]; filter9?: string[]; filter10?: string[]
    filter11?: string[]; filter12?: string[]; filter13?: string[]; filter14?: string[]; filter15?: string[]
    scales?: string[]
  }
}

export interface FilterConfigItem {
  key: string
  title: string
  field: string
  type: 'static' | 'dynamic'
  parentField: string | null
  parentValue: string | null
  categorySlug?: string
}

interface FilterPanelProps {
  products: Product[]
  onFilter: (filtered: Product[], activeFilters: FilterState) => void
  hidePriceSlider?: boolean
  hideMobileButton?: boolean
  allCategories?: string[]
  filterConfigSections: FilterConfigItem[]
  filterCounts?: Record<string, Record<string, number>>
  categoryNames?: Record<string, string>
  activeFilters?: FilterState
  forceOpen?: boolean
  showOnlySale?: boolean
  onToggleSale?: () => void
}

const FilterPanel = forwardRef<any, FilterPanelProps>(
  (
    {
      products,
      onFilter,
      hidePriceSlider = false,
      hideMobileButton = false,
      allCategories = [],
      filterConfigSections,
      filterCounts = {},
      categoryNames = {},
      activeFilters: externalFilters,
      forceOpen = false,
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
        filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
        filter6: [], filter7: [], filter8: [], filter9: [], filter10: [],
        filter11: [], filter12: [], filter13: [], filter14: [], filter15: [],
        scales: [],
        tags: [],
        gameSystems: [], factions: [], types: [], fileFormats: [],
        categoryFilters: {},
      }
    })
    const [priceMax, setPriceMax] = useState(3500)
    const [fieldOptions, setFieldOptions] = useState<Record<string, string[]>>({})

    useEffect(() => {
      if (externalFilters) setFilters(externalFilters)
    }, [externalFilters])

    useEffect(() => {
      setIsModalOpen(forceOpen)
    }, [forceOpen])

    useEffect(() => {
      const loadOptions = async () => {
        if (filterConfigSections.length === 0) return
        const slugs = filters.categories
        const params = new URLSearchParams()
        slugs.forEach(s => params.append('category', s))
        if (slugs.length > 1) params.set('separate', 'true')

        const res = await fetch(`/api/filters?${params.toString()}`)
        if (!res.ok) return
        const data = await res.json()

        const options: Record<string, string[]> = {}
        for (const section of filterConfigSections) {
          const field = section.field
          if (slugs.length > 1 && section.categorySlug) {
            const catFilters = data.categoryFilters?.[section.categorySlug]
            if (catFilters) {
              options[section.key] = (catFilters as any)[field] || []
            }
          } else {
            options[section.key] = (data as any)[field] || []
          }
        }
        setFieldOptions(options)
      }
      loadOptions()
    }, [filterConfigSections, filters.categories])

    const toggleFilter = useCallback(
      (key: string, value: string, categorySlug?: string) => {
        setFilters((prev) => {
          if (prev.categories.length > 1 && categorySlug) {
            const currentCatFilters = prev.categoryFilters || {}
            const catFilter = { ...currentCatFilters[categorySlug] } as any
            const currentValues = catFilter[key] || []
            const newValues = currentValues.includes(value)
              ? currentValues.filter((v: string) => v !== value)
              : [...currentValues, value]
            return {
              ...prev,
              categoryFilters: {
                ...currentCatFilters,
                [categorySlug]: { ...catFilter, [key]: newValues },
              },
            }
          } else {
            const currentValues = (prev as any)[key] || []
            const newValues = currentValues.includes(value)
              ? currentValues.filter((v: string) => v !== value)
              : [...currentValues, value]
            return { ...prev, [key]: newValues }
          }
        })
      },
      []
    )

    const resetFilters = useCallback(() => {
      setFilters({
        categories: [],
        filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
        filter6: [], filter7: [], filter8: [], filter9: [], filter10: [],
        filter11: [], filter12: [], filter13: [], filter14: [], filter15: [],
        scales: [],
        tags: [],
        gameSystems: [], factions: [], types: [], fileFormats: [],
        categoryFilters: {},
      })
      setPriceMax(3500)
      if (showOnlySale && onToggleSale) onToggleSale()
    }, [showOnlySale, onToggleSale])

    useImperativeHandle(ref, () => ({ resetFilters }))

    useEffect(() => {
      onFilter([], filters)
    }, [filters, onFilter])

    const visibleSections: FilterConfigItem[] = []
    const usedKeys = new Set<string>()

    for (const section of filterConfigSections) {
      if (usedKeys.has(section.key)) continue

      let shouldShow = !section.parentField

      if (!shouldShow && section.parentField) {
        const parentKey = section.parentField.replace(/\s/g, '')
        const allForSameKey = filterConfigSections.filter(s => s.key === section.key)
        shouldShow = allForSameKey.some(s => {
          if (!s.parentField) return true
          const pField = s.parentField.replace(/\s/g, '')
          const parentValues = s.categorySlug
            ? (filters.categoryFilters?.[s.categorySlug] as any)?.[pField] || []
            : (filters as any)[pField] || []
          if (!s.parentValue) return false
          const requiredValues = s.parentValue.split(',').map(v => v.trim()).filter(Boolean)
          return requiredValues.some(v => parentValues.includes(v))
        })
      }

      if (shouldShow) {
        visibleSections.push(section)
        usedKeys.add(section.key)
      }
    }

    const hasActiveFilters = Object.values(filters).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    )

    const renderSections = () => (
      <>
        <FilterSection
          key="categories"
          sectionKey="categories"
          title="Категория"
          options={Object.keys(categoryNames)}
          selected={filters.categories}
          onToggle={(value) => toggleFilter('categories', value)}
          categoryNames={categoryNames}
        />
        {visibleSections.map(section => {
          const selected = section.categorySlug
            ? (filters.categoryFilters?.[section.categorySlug] as any)?.[section.field] || []
            : (filters as any)[section.field] || []
          const options = fieldOptions[section.key] || []
          const counts = filterCounts[section.field] || undefined
          return (
            <FilterSection
              key={section.key}
              sectionKey={section.field}
              title={section.title}
              options={options}
              selected={selected}
              onToggle={(value) => toggleFilter(section.field, value, section.categorySlug)}
              categorySlug={section.categorySlug}
              counts={counts}
            />
          )
        })}
      </>
    )

    return (
      <>
        {!hideMobileButton && (
          <button onClick={() => setIsModalOpen(true)} className="lg:hidden flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg mb-4">
            <SlidersHorizontal size={18} /> Фильтры
          </button>
        )}

        <div className="hidden lg:block">
          <div className="space-y-4">
            {renderSections()}
            {onToggleSale && (
              <div className="pt-2">
                <button onClick={onToggleSale} className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${showOnlySale ? 'border border-white text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>Акционная подборка</button>
              </div>
            )}
            {!hidePriceSlider && (
              <div className="pt-2">
                <div className="flex justify-between items-center"><span className="text-white font-semibold">Цена: до {priceMax} ₽</span></div>
                <input type="range" min={0} max={3500} step={10} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full mt-2" />
              </div>
            )}
            {hasActiveFilters && (
              <div className="pt-2">
                <ActiveFilters filters={filters} onRemove={(key, value) => toggleFilter(key, value)} onClearAll={resetFilters} categoryNames={categoryNames} />
              </div>
            )}
            <button onClick={resetFilters} className="text-accent text-sm mt-2">Сбросить все фильтры</button>
          </div>
        </div>

        <MobileFilterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onClearAll={resetFilters} onApply={() => setIsModalOpen(false)}>
          {renderSections()}
          {onToggleSale && (
            <div className="pt-2"><button onClick={onToggleSale} className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${showOnlySale ? 'border border-white text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>Акционная подборка</button></div>
          )}
          {!hidePriceSlider && (
            <div className="pt-2">
              <div className="flex justify-between items-center"><span className="text-white font-semibold">Цена: до {priceMax} ₽</span></div>
              <input type="range" min={0} max={3500} step={10} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full mt-2" />
            </div>
          )}
        </MobileFilterModal>
      </>
    )
  }
)

FilterPanel.displayName = 'FilterPanel'
export { FilterPanel }