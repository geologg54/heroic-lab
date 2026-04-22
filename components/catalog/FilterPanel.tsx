// components/catalog/FilterPanel.tsx
'use client'
import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { Product } from '@/types'
import { SlidersHorizontal, X, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
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
}

// Функция для умной сортировки: числа по возрастанию, строки по алфавиту
const smartSort = (a: string, b: string): number => {
  // Проверяем, являются ли обе строки числами
  const aNum = Number(a)
  const bNum = Number(b)
  if (!isNaN(aNum) && !isNaN(bNum)) {
    return aNum - bNum
  }
  // Если одна число, другая нет - число идёт раньше? Обычно строки сортируются по алфавиту
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export const FilterPanel = forwardRef<any, FilterPanelProps>(({ 
  products, 
  onFilter, 
  hidePriceSlider = false, 
  hideMobileButton = false,
  filterNames = {},
  allCategories = [],
  allFilterOptions,
  availableTags = [],
  categoryNames = {},
  activeFilters: externalFilters,
  forceOpen = false,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(externalFilters || {
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

  // Состояние пагинации для тегов (не сбрасываем при каждом изменении фильтров)
  const [tagsPage, setTagsPage] = useState(1)
  const tagsPerPage = 10

  const prevFiltersRef = useRef<FilterState>(filters)
  const prevPriceMaxRef = useRef(priceMax)
  const isFirstRender = useRef(true)

  useEffect(() => {
    setIsOpen(forceOpen)
  }, [forceOpen])

  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters)
    }
  }, [externalFilters])

  const getSectionOptions = (sectionKey: string): string[] => {
    if (sectionKey === 'tags') {
      return availableTags
    }
    if (allFilterOptions) {
      return (allFilterOptions as any)[sectionKey] || []
    }
    // fallback (не используется, так как передаём allFilterOptions)
    return []
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[]
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      }
    })
    // Не сбрасываем страницу тегов при toggle
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
    setTagsPage(1) // сбрасываем страницу тегов только при полном сбросе
  }

  useImperativeHandle(ref, () => ({
    resetFilters
  }))

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
      // Не сбрасываем tagsPage при изменении фильтров, кроме случаев когда изменилась категория?
      // Если категория изменилась, набор тегов меняется, поэтому можно сбросить страницу
      if (prevFiltersRef.current.categories !== filters.categories) {
        setTagsPage(1)
      }
    }
    prevFiltersRef.current = filters
    prevPriceMaxRef.current = priceMax
  }, [filters, priceMax, applyFilters])

  const scalesOptions = getSectionOptions('scales')
  const shouldShowScales = scalesOptions.length >= 2

  const sections = [
    { key: 'categories', title: 'Категория' },
    { key: 'filter1', title: filterNames.filter1Name || '' },
    { key: 'filter2', title: filterNames.filter2Name || '' },
    { key: 'filter3', title: filterNames.filter3Name || '' },
    { key: 'filter4', title: filterNames.filter4Name || '' },
    { key: 'filter5', title: filterNames.filter5Name || '' },
    { key: 'tags', title: 'Теги' },
    ...(shouldShowScales ? [{ key: 'scales', title: 'Масштаб' }] : []),
  ].filter(section => {
    if (section.key === 'categories' || section.key === 'tags') return true
    return section.title && getSectionOptions(section.key).length > 0
  })

  const FilterSection = ({ title, sectionKey, options, selected }: { 
    title: string; 
    sectionKey: string; 
    options: string[]; 
    selected: string[] 
  }) => {
    const isExpanded = expandedSections[sectionKey]
    const isTagsSection = sectionKey === 'tags'
    
    // Сортируем опции
    const sortedOptions = [...options].sort(smartSort)
    
    const totalPages = Math.ceil(sortedOptions.length / tagsPerPage)
    const startIndex = (tagsPage - 1) * tagsPerPage
    const endIndex = startIndex + tagsPerPage
    const visibleOptions = isTagsSection ? sortedOptions.slice(startIndex, endIndex) : sortedOptions

    const getDisplayName = (value: string) => {
      if (sectionKey === 'categories' && categoryNames[value]) {
        return categoryNames[value]
      }
      return value
    }

    return (
      <div className="pb-3">
        <button onClick={() => toggleSection(sectionKey)} className="flex justify-between items-center w-full text-left py-2 text-white font-normal hover:text-accent transition">
          <span>{title}</span>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {visibleOptions.map(opt => (
              <label key={opt} className="flex items-center gap-2 text-gray-300 text-sm">
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt)} 
                  onChange={() => toggleFilter(sectionKey as keyof FilterState, opt)} 
                /> {getDisplayName(opt)}
              </label>
            ))}
            {isTagsSection && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setTagsPage(p => Math.max(1, p - 1))}
                  disabled={tagsPage === 1}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-400">{tagsPage} / {totalPages}</span>
                <button
                  onClick={() => setTagsPage(p => Math.min(totalPages, p + 1))}
                  disabled={tagsPage === totalPages}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
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
              options={getSectionOptions(section.key)}
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
                categoryNames={categoryNames}
              />
            </div>
          )}
          <button onClick={resetFilters} className="text-accent text-sm mt-2">Сбросить все фильтры</button>
        </div>
      </div>
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
                  options={getSectionOptions(section.key)}
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
})