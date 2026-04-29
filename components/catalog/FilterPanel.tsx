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

  // 🆕 Раздельные опции и названия фильтров
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
}

const smartSort = (a: string, b: string): number => {
  const aNum = Number(a)
  const bNum = Number(b)
  if (!isNaN(aNum) && !isNaN(bNum)) {
    return aNum - bNum
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export const FilterPanel = forwardRef<any, FilterPanelProps>(({
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
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
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

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
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

  const getSectionOptions = (sectionKey: string, categorySlug?: string): string[] => {
    if (categorySlug && categoryFilterOptions && categoryFilterOptions[categorySlug]) {
      if (sectionKey.startsWith('filter')) {
        const field = sectionKey.split('_')[0] as keyof typeof categoryFilterOptions[string]
        return categoryFilterOptions[categorySlug][field] || []
      }
      if (sectionKey === 'scales') {
        return categoryFilterOptions[categorySlug].scales || []
      }
    }

    if (sectionKey === 'tags') return availableTags
    if (allFilterOptions) {
      return (allFilterOptions as any)[sectionKey] || []
    }
    return []
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleFilter = (key: string, value: string, categorySlug?: string) => {
    setFilters(prev => {
      if (prev.categories.length > 1 && categorySlug) {
        const currentCatFilters = prev.categoryFilters || {}
        const catFilter = currentCatFilters[categorySlug] || {}
        const field = key as keyof typeof catFilter
        let currentValues = catFilter[field]
        if (!Array.isArray(currentValues)) {
          currentValues = []
        }
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
        return {
          ...prev,
          categoryFilters: {
            ...currentCatFilters,
            [categorySlug]: {
              ...catFilter,
              [field]: newValues,
            }
          }
        }
      } else {
        const currentValues = (prev as any)[key] as string[] | undefined
        const arr = Array.isArray(currentValues) ? currentValues : []
        const newValues = arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value]
        return { ...prev, [key]: newValues }
      }
    })
  }

  const resetFilters = () => {
    setFilters({
      categories: [],
      filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
      tags: [], scales: [],
      gameSystems: [], factions: [], types: [], fileFormats: [],
      categoryFilters: {},
    })
    setPriceMax(3500)
    setTagsPage(1)
  }

  useImperativeHandle(ref, () => ({
    resetFilters
  }))

  const applyFilters = useCallback(() => {
    let filtered = [...products]

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => {
        const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
        return filters.categories.includes(catSlug)
      })
    }

    const hasAny = (productValues: string[], selected: string[]) =>
      selected.some(sel => productValues.includes(sel))

    if (filters.categories.length > 1 && filters.categoryFilters) {
      filtered = filtered.filter(p => {
        const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
        const catFilter = filters.categoryFilters?.[catSlug]
        if (!catFilter) return true
        const checks: boolean[] = []
        if (catFilter.filter1?.length) {
          const vals = (p.filter1 || '').split(',').map(s => s.trim())
          checks.push(hasAny(vals, catFilter.filter1!))
        }
        if (catFilter.filter2?.length) {
          const vals = (p.filter2 || '').split(',').map(s => s.trim())
          checks.push(hasAny(vals, catFilter.filter2!))
        }
        if (catFilter.filter3?.length) {
          const vals = (p.filter3 || '').split(',').map(s => s.trim())
          checks.push(hasAny(vals, catFilter.filter3!))
        }
        if (catFilter.filter4?.length) {
          const vals = (p.filter4 || '').split(',').map(s => s.trim())
          checks.push(hasAny(vals, catFilter.filter4!))
        }
        if (catFilter.filter5?.length) {
          const vals = (p.filter5 || '').split(',').map(s => s.trim())
          checks.push(hasAny(vals, catFilter.filter5!))
        }
        if (catFilter.scales?.length) {
          const vals = (p.scale || '').split(',').map(s => s.trim())
          checks.push(hasAny(vals, catFilter.scales!))
        }
        return checks.length === 0 || checks.every(Boolean)
      })
    } else {
      if (filters.filter1.length > 0) {
        filtered = filtered.filter(p => {
          const vals = (p.filter1 || '').split(',').map(s => s.trim())
          return hasAny(vals, filters.filter1)
        })
      }
      if (filters.filter2.length > 0) {
        filtered = filtered.filter(p => {
          const vals = (p.filter2 || '').split(',').map(s => s.trim())
          return hasAny(vals, filters.filter2)
        })
      }
      if (filters.filter3.length > 0) {
        filtered = filtered.filter(p => {
          const vals = (p.filter3 || '').split(',').map(s => s.trim())
          return hasAny(vals, filters.filter3)
        })
      }
      if (filters.filter4.length > 0) {
        filtered = filtered.filter(p => {
          const vals = (p.filter4 || '').split(',').map(s => s.trim())
          return hasAny(vals, filters.filter4)
        })
      }
      if (filters.filter5.length > 0) {
        filtered = filtered.filter(p => {
          const vals = (p.filter5 || '').split(',').map(s => s.trim())
          return hasAny(vals, filters.filter5)
        })
      }
      if (filters.scales.length > 0) {
        filtered = filtered.filter(p => {
          const vals = (p.scale || '').split(',').map(s => s.trim())
          return hasAny(vals, filters.scales)
        })
      }
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(p => hasAny(p.tags, filters.tags))
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
      if (prevFiltersRef.current.categories !== filters.categories) {
        setTagsPage(1)
      }
    }
    prevFiltersRef.current = filters
    prevPriceMaxRef.current = priceMax
  }, [filters, priceMax, applyFilters])

  // Формирование секций
  const hasCategory = filters.categories.length > 0
  const multiCategory = hasCategory && filters.categories.length > 1

  const sections: Array<{ key: string; title: string; field?: keyof FilterState; categorySlug?: string }> = [
    { key: 'categories', title: 'Категория' },
  ]

  if (hasCategory) {
    if (multiCategory && categoryFilterGroups.length > 0) {
      // Используем раздельные фильтры (без префикса категории в названии)
      categoryFilterGroups.forEach(group => {
        if (group.filter1Name) {
          const title = categoryFilterNames?.[group.categorySlug]?.filter1Name || group.filter1Name || 'Фильтр 1'
          sections.push({ key: `filter1_${group.categorySlug}`, title, categorySlug: group.categorySlug })
        }
        if (group.filter2Name) {
          const title = categoryFilterNames?.[group.categorySlug]?.filter2Name || group.filter2Name || 'Фильтр 2'
          sections.push({ key: `filter2_${group.categorySlug}`, title, categorySlug: group.categorySlug })
        }
        if (group.filter3Name) {
          const title = categoryFilterNames?.[group.categorySlug]?.filter3Name || group.filter3Name || 'Фильтр 3'
          sections.push({ key: `filter3_${group.categorySlug}`, title, categorySlug: group.categorySlug })
        }
        if (group.filter4Name) {
          const title = categoryFilterNames?.[group.categorySlug]?.filter4Name || group.filter4Name || 'Фильтр 4'
          sections.push({ key: `filter4_${group.categorySlug}`, title, categorySlug: group.categorySlug })
        }
        if (group.filter5Name) {
          const title = categoryFilterNames?.[group.categorySlug]?.filter5Name || group.filter5Name || 'Фильтр 5'
          sections.push({ key: `filter5_${group.categorySlug}`, title, categorySlug: group.categorySlug })
        }
      })
      const scalesOpts = getSectionOptions('scales')
      if (scalesOpts.length >= 2) sections.push({ key: 'scales', title: 'Масштаб' })
    } else {
      if (filterNames?.filter1Name) sections.push({ key: 'filter1', title: filterNames.filter1Name! })
      if (filterNames?.filter2Name) sections.push({ key: 'filter2', title: filterNames.filter2Name! })
      if (filterNames?.filter3Name) sections.push({ key: 'filter3', title: filterNames.filter3Name! })
      if (filterNames?.filter4Name) sections.push({ key: 'filter4', title: filterNames.filter4Name! })
      if (filterNames?.filter5Name) sections.push({ key: 'filter5', title: filterNames.filter5Name! })
      const scalesOpts = getSectionOptions('scales')
      if (scalesOpts.length >= 2) sections.push({ key: 'scales', title: 'Масштаб' })
    }
  }

  sections.push({ key: 'tags', title: 'Теги' })

  const FilterSection = ({ title, sectionKey, options, selected, categorySlug }: {
    title: string
    sectionKey: string
    options: string[]
    selected: string[]
    categorySlug?: string
  }) => {
    const isExpanded = expandedSections[sectionKey] ?? false
    const isTagsSection = sectionKey === 'tags'
    const sortedOptions = [...options].sort(smartSort)
    const totalPages = Math.ceil(sortedOptions.length / tagsPerPage)
    const startIndex = (tagsPage - 1) * tagsPerPage
    const endIndex = startIndex + tagsPerPage
    const visibleOptions = isTagsSection ? sortedOptions.slice(startIndex, endIndex) : sortedOptions

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
                  onChange={() => toggleFilter(sectionKey.split('_')[0], opt, categorySlug)}
                />
                <span>{sectionKey === 'categories' && categoryNames[opt] ? categoryNames[opt] : opt}</span>
              </label>
            ))}
            {isTagsSection && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setTagsPage(p => Math.max(1, p - 1))} disabled={tagsPage === 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                <span className="text-xs text-gray-400">{tagsPage} / {totalPages}</span>
                <button onClick={() => setTagsPage(p => Math.min(totalPages, p + 1))} disabled={tagsPage === totalPages} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const hasActiveFilters = Object.values(filters).some(arr => Array.isArray(arr) && arr.length > 0)

  return (
    <>
      {!hideMobileButton && (
        <button onClick={() => setIsOpen(true)} className="lg:hidden flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg mb-4">
          <SlidersHorizontal size={18} /> Фильтры
        </button>
      )}
      <div className="hidden lg:block">
        <div className="space-y-4">
          {sections.map(section => {
            const isMulti = multiCategory && !!section.categorySlug
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
            const options = section.key === 'tags' ? availableTags : getSectionOptions(section.key.split('_')[0], section.categorySlug)
            return (
              <FilterSection
                key={section.key}
                title={section.title}
                sectionKey={section.key}
                options={options}
                selected={selected}
                categorySlug={section.categorySlug}
              />
            )
          })}
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
                onRemove={(key, value) => toggleFilter(key, value)}
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
              {sections.map(section => {
                const isMulti = multiCategory && !!section.categorySlug
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
                const options = section.key === 'tags' ? availableTags : getSectionOptions(section.key.split('_')[0], section.categorySlug)
                return (
                  <FilterSection
                    key={section.key}
                    title={section.title}
                    sectionKey={section.key}
                    options={options}
                    selected={selected}
                    categorySlug={section.categorySlug}
                  />
                )
              })}
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