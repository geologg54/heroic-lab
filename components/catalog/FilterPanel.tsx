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
  // для обратной совместимости оставим старые, но не будем их показывать
  gameSystems?: string[]
  factions?: string[]
  types?: string[]
  scales?: string[]
  fileFormats?: string[]
}

interface FilterPanelProps {
  products: Product[]
  onFilter: (filtered: Product[], activeFilters: FilterState) => void
  hidePriceSlider?: boolean
  hideMobileButton?: boolean
  // 🆕 Настройки фильтров из категории
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
    gameSystems: [],
    factions: [],
    types: [],
    scales: [],
    fileFormats: [],
  })
  const [priceMax, setPriceMax] = useState(2000)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: false,
    filter1: false,
    filter2: false,
    filter3: false,
    filter4: false,
    filter5: false,
    tags: false,
  })

  const prevFiltersRef = useRef<FilterState>(filters)
  const prevPriceMaxRef = useRef(priceMax)
  const isFirstRender = useRef(true)

  // 🆕 Собираем уникальные значения для каждого фильтра из товаров
  const filterOptions = {
    categories: [...new Set(products.map(p => typeof p.category === 'object' ? p.category.slug : p.categorySlug))],
    filter1: [...new Set(products.map(p => p.filter1).filter(Boolean))],
    filter2: [...new Set(products.map(p => p.filter2).filter(Boolean))],
    filter3: [...new Set(products.map(p => p.filter3).filter(Boolean))],
    filter4: [...new Set(products.map(p => p.filter4).filter(Boolean))],
    filter5: [...new Set(products.map(p => p.filter5).filter(Boolean))],
    tags: [...new Set(products.flatMap(p => p.tags))],
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }))
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
      gameSystems: [],
      factions: [],
      types: [],
      scales: [],
      fileFormats: [],
    })
    setPriceMax(2000)
  }

  const applyFilters = useCallback(() => {
    let filtered = products

    if (filters.categories.length) {
      filtered = filtered.filter(p => {
        const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
        return filters.categories.includes(catSlug)
      })
    }
    if (filters.filter1.length) filtered = filtered.filter(p => p.filter1 && filters.filter1.includes(p.filter1))
    if (filters.filter2.length) filtered = filtered.filter(p => p.filter2 && filters.filter2.includes(p.filter2))
    if (filters.filter3.length) filtered = filtered.filter(p => p.filter3 && filters.filter3.includes(p.filter3))
    if (filters.filter4.length) filtered = filtered.filter(p => p.filter4 && filters.filter4.includes(p.filter4))
    if (filters.filter5.length) filtered = filtered.filter(p => p.filter5 && filters.filter5.includes(p.filter5))
    if (filters.tags.length) {
      filtered = filtered.filter(p => p.tags.some(t => filters.tags.includes(t)))
    }
    // Старые фильтры пока не применяем, чтобы не мешать

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

  // Определяем, какие секции показывать (если название задано и есть хотя бы одно значение)
  const sections = [
    { key: 'categories', title: 'Категория' },
    { key: 'filter1', title: filterNames.filter1Name || '' },
    { key: 'filter2', title: filterNames.filter2Name || '' },
    { key: 'filter3', title: filterNames.filter3Name || '' },
    { key: 'filter4', title: filterNames.filter4Name || '' },
    { key: 'filter5', title: filterNames.filter5Name || '' },
    { key: 'tags', title: 'Теги' },
  ].filter(section => {
    if (section.key === 'categories' || section.key === 'tags') return true
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
              selected={filters[section.key as keyof FilterState] as string[] || []}
            />
          ))}
          {!hidePriceSlider && (
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Цена: до {priceMax} ₽</span>
              </div>
              <input type="range" min={0} max={2000} step={10} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full mt-2" />
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
      {/* Мобильная модалка (аналогично) */}
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
                  selected={filters[section.key as keyof FilterState] as string[] || []}
                />
              ))}
              {!hidePriceSlider && (
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Цена: до {priceMax} ₽</span>
                  </div>
                  <input type="range" min={0} max={2000} step={10} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full mt-2" />
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