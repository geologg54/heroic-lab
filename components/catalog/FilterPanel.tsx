// components/catalog/FilterPanel.tsx
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Product } from '@/types'
import { SlidersHorizontal, X, ChevronDown, ChevronRight } from 'lucide-react'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'

export interface FilterState {
  categories: string[]
  filter1: string[]
  filter2: string[]
  filter3: string[]
  filter4: string[]
  filter5: string[]
  tags: string[]
  scales: string[]
  // старые поля для обратной совместимости (не показываем, но храним)
  gameSystems: string[]
  factions: string[]
  types: string[]
  fileFormats: string[]
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
  }
}

export const FilterPanel = ({ 
  products, 
  onFilter, 
  hidePriceSlider = false, 
  hideMobileButton = false,
  filterNames = {}
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
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
  })
  const [priceMax, setPriceMax] = useState(3500)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: false,
    filter1: false,
    filter2: false,
    filter3: false,
    filter4: false,
    filter5: false,
    tags: false,
    scales: false,
  })

  const prevFiltersRef = useRef<FilterState>(filters)
  const prevPriceMaxRef = useRef(priceMax)
  const isFirstRender = useRef(true)

  // Собираем уникальные значения, разбивая строки по запятой
  const filterOptions = {
    categories: [...new Set(products.map(p => typeof p.category === 'object' ? p.category.slug : p.categorySlug))],
    filter1: [...new Set(products.flatMap(p => (p.filter1 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter2: [...new Set(products.flatMap(p => (p.filter2 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter3: [...new Set(products.flatMap(p => (p.filter3 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter4: [...new Set(products.flatMap(p => (p.filter4 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter5: [...new Set(products.flatMap(p => (p.filter5 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    tags: [...new Set(products.flatMap(p => p.tags))],
    scales: [...new Set(products.flatMap(p => (p.scale || '').split(',').map(s => s.trim()).filter(Boolean)))],
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[] // теперь гарантированно массив
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      }
    })
  }

  const resetFilters = () => {
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
    })
    setPriceMax(3500)
  }

  const applyFilters = useCallback(() => {
    let filtered = products

    if (filters.categories.length) {
      filtered = filtered.filter(p => {
        const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
        return filters.categories.includes(catSlug)
      })
    }

    const hasAny = (productValues: string[], selected: string[]) => {
      return selected.some(sel => productValues.includes(sel))
    }

    if (filters.filter1.length) {
      filtered = filtered.filter(p => {
        const vals = (p.filter1 || '').split(',').map(s => s.trim())
        return hasAny(vals, filters.filter1)
      })
    }
    if (filters.filter2.length) {
      filtered = filtered.filter(p => {
        const vals = (p.filter2 || '').split(',').map(s => s.trim())
        return hasAny(vals, filters.filter2)
      })
    }
    if (filters.filter3.length) {
      filtered = filtered.filter(p => {
        const vals = (p.filter3 || '').split(',').map(s => s.trim())
        return hasAny(vals, filters.filter3)
      })
    }
    if (filters.filter4.length) {
      filtered = filtered.filter(p => {
        const vals = (p.filter4 || '').split(',').map(s => s.trim())
        return hasAny(vals, filters.filter4)
      })
    }
    if (filters.filter5.length) {
      filtered = filtered.filter(p => {
        const vals = (p.filter5 || '').split(',').map(s => s.trim())
        return hasAny(vals, filters.filter5)
      })
    }

    if (filters.tags.length) {
      filtered = filtered.filter(p => hasAny(p.tags, filters.tags))
    }

    if (filters.scales.length) {
      filtered = filtered.filter(p => {
        const vals = (p.scale || '').split(',').map(s => s.trim())
        return hasAny(vals, filters.scales)
      })
    }

    filtered = filtered.filter(p => p.price <= priceMax)

    onFilter(filtered, filters)
  }, [products, filters, priceMax, onFilter])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      applyFilters()
      return
    }
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)
    const priceChanged = prevPriceMaxRef.current !== priceMax
    if (filtersChanged || priceChanged) {
      applyFilters()
    }
    prevFiltersRef.current = filters
    prevPriceMaxRef.current = priceMax
  }, [filters, priceMax, applyFilters])

  const sections = [
    { key: 'categories', title: 'Категория' },
    { key: 'filter1', title: filterNames.filter1Name || '' },
    { key: 'filter2', title: filterNames.filter2Name || '' },
    { key: 'filter3', title: filterNames.filter3Name || '' },
    { key: 'filter4', title: filterNames.filter4Name || '' },
    { key: 'filter5', title: filterNames.filter5Name || '' },
    { key: 'tags', title: 'Теги' },
    { key: 'scales', title: 'Масштаб' },
  ].filter(section => {
    if (section.key === 'categories' || section.key === 'tags' || section.key === 'scales') return true
    return section.title && filterOptions[section.key as keyof typeof filterOptions]?.length > 0
  })

  const FilterSection = ({ title, sectionKey, options, selected }: { 
    title: string; 
    sectionKey: string; 
    options: string[]; 
    selected: string[] 
  }) => {
    const isExpanded = expandedSections[sectionKey]
    return (
      <div className="pb-3">
        <button onClick={() => toggleSection(sectionKey)} className="flex justify-between items-center w-full text-left py-2 text-white font-normal hover:text-accent transition">
          <span>{title}</span>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-2 text-gray-300 text-sm">
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt)} 
                  onChange={() => toggleFilter(sectionKey as keyof FilterState, opt)} 
                /> {opt}
              </label>
            ))}
          </div>
        )}
      </div>
    )
  }

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0)

  return (
    <>
      {!hideMobileButton && (
        <button onClick={() => setIsOpen(true)} className="lg:hidden flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg mb-4">
          <SlidersHorizontal size={18} /> Фильтры
        </button>
      )}
      <div className="hidden lg:block">
        <div className="space-y-4">
          {sections.map(section => (
            <FilterSection
              key={section.key}
              title={section.title}
              sectionKey={section.key}
              options={filterOptions[section.key as keyof typeof filterOptions] || []}
              selected={filters[section.key as keyof FilterState] as string[]}
            />
          ))}
          {!hidePriceSlider && (
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Цена: до {priceMax} ₽</span>
              </div>
              <input type="range" min={0} max={3500} step={10} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full mt-2" />
            </div>
          )}
          {hasActiveFilters && (
            <div className="pt-2">
              <ActiveFilters
                filters={filters}
                onRemove={(key, value) => toggleFilter(key as keyof FilterState, value)}
                onClearAll={resetFilters}
              />
            </div>
          )}
          <button onClick={resetFilters} className="text-accent text-sm mt-2">Сбросить все фильтры</button>
        </div>
      </div>
      {/* Мобильная модалка */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 p-4 overflow-auto">
          <div className="bg-cardbg p-6 rounded-xl max-w-md mx-auto relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400"><X size={24} /></button>
            <h2 className="text-xl font-bold text-white mb-4">Фильтры</h2>
            <div className="space-y-4">
              {sections.map(section => (
                <FilterSection
                  key={section.key}
                  title={section.title}
                  sectionKey={section.key}
                  options={filterOptions[section.key as keyof typeof filterOptions] || []}
                  selected={filters[section.key as keyof FilterState] as string[]}
                />
              ))}
              {!hidePriceSlider && (
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Цена: до {priceMax} ₽</span>
                  </div>
                  <input type="range" min={0} max={3500} step={10} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full mt-2" />
                </div>
              )}
              <button onClick={() => setIsOpen(false)} className="mt-6 w-full bg-accent py-2 rounded-lg">Применить</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}