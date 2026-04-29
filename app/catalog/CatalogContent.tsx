// app/catalog/CatalogContent.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/catalog/ProductCard'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import type { FilterState } from '@/components/catalog/FilterPanel'
import { SortDropdown } from '@/components/catalog/SortDropdown'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import Pagination from '@/components/catalog/Pagination'
import type { Product } from '@/types'
import { X, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'

interface StaticFilterOptions {
  categories: string[]
  filter1: string[]
  filter2: string[]
  filter3: string[]
  filter4: string[]
  filter5: string[]
  scales: string[]
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

interface CategoryFilterOptions {
  [slug: string]: {
    filter1: string[]
    filter2: string[]
    filter3: string[]
    filter4: string[]
    filter5: string[]
    scales: string[]
  }
}

interface CategoryFilterNames {
  [slug: string]: {
    filter1Name?: string | null
    filter2Name?: string | null
    filter3Name?: string | null
    filter4Name?: string | null
    filter5Name?: string | null
  }
}

interface CatalogContentProps {
  initialProducts: Product[]
  initialTotal: number
  initialPage: number
  totalPages: number
  categories: string[]
  allFilterOptions: StaticFilterOptions
  categoryNames: Record<string, string>
  categoriesData: CategoryWithFilters[]
}

export default function CatalogContent({
  initialProducts,
  initialTotal,
  initialPage,
  totalPages: initialTotalPages,
  categories,
  allFilterOptions: initialFilterOptions,
  categoryNames,
  categoriesData,
}: CatalogContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)

  const [staticFilterOptions, setStaticFilterOptions] = useState<StaticFilterOptions>(initialFilterOptions)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [filterNames, setFilterNames] = useState<Record<string, string | null> | undefined>(undefined)
  const [categoryFilterGroups, setCategoryFilterGroups] = useState<CategoryFilterGroup[]>([])

  const [categoryFilterOptions, setCategoryFilterOptions] = useState<CategoryFilterOptions>({})
  const [categoryFilterNames, setCategoryFilterNames] = useState<CategoryFilterNames>({})

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

  const [activeFilters, setActiveFilters] = useState<FilterState>(getInitialFilters())
  const [sortBy, setSortBy] = useState('newest')
  const [priceMax, setPriceMax] = useState(3500)
  const [tempPrice, setTempPrice] = useState(3500)

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<FilterState>(activeFilters)
  const [mobileExpandedSections, setMobileExpandedSections] = useState<Record<string, boolean>>({})

  const fetchStaticFilters = useCallback(async (categorySlugs?: string[]) => {
    try {
      if (!categorySlugs || categorySlugs.length === 0) {
        setStaticFilterOptions(prev => ({ ...prev, filter1: [], filter2: [], filter3: [], filter4: [], filter5: [], scales: [] }))
        setAvailableTags([])
        setFilterNames(undefined)
        setCategoryFilterGroups([])
        setCategoryFilterOptions({})
        setCategoryFilterNames({})
        return
      }

      const params = new URLSearchParams()
      categorySlugs.forEach(slug => params.append('category', slug))
      if (categorySlugs.length > 1) {
        params.set('separate', 'true')
      }

      const res = await fetch(`/api/filters?${params.toString()}`)
      const data = await res.json()
      if (!data) return

      if (categorySlugs.length > 1 && data.categoryFilters) {
        setCategoryFilterOptions(data.categoryFilters)
        setCategoryFilterNames(data.filterNames || {})
        setAvailableTags(data.tags || [])
        setFilterNames(undefined)

        const groups = categorySlugs
          .map(slug => {
            const cat = categoriesData.find(c => c.slug === slug)
            if (!cat) return null
            return {
              categorySlug: slug,
              categoryName: categoryNames[slug] || slug,
              filter1Name: cat.filter1Name,
              filter2Name: cat.filter2Name,
              filter3Name: cat.filter3Name,
              filter4Name: cat.filter4Name,
              filter5Name: cat.filter5Name,
            } as CategoryFilterGroup
          })
          .filter(Boolean) as CategoryFilterGroup[]
        setCategoryFilterGroups(groups)
      } else {
        setStaticFilterOptions(prev => ({
          ...prev,
          filter1: data.filter1 || [],
          filter2: data.filter2 || [],
          filter3: data.filter3 || [],
          filter4: data.filter4 || [],
          filter5: data.filter5 || [],
          scales: data.scales || [],
        }))
        setAvailableTags(data.tags || [])
        setFilterNames(data.filterNames || undefined)
        setCategoryFilterGroups([])
        setCategoryFilterOptions({})
        setCategoryFilterNames({})
      }
    } catch (error) {
      console.error('Ошибка загрузки фильтров:', error)
    }
  }, [categoriesData, categoryNames, categories])

  useEffect(() => {
    fetchStaticFilters()
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (priceMax < 3500) params.set('maxPrice', priceMax.toString())

    activeFilters.categories.forEach(cat => params.append('category', cat))
    activeFilters.tags.forEach(v => params.append('tags', v))

    const useCategoryFilters = activeFilters.categories.length > 1 && activeFilters.categoryFilters && Object.keys(activeFilters.categoryFilters).length > 0
    if (useCategoryFilters) {
      const catFilters = activeFilters.categoryFilters!
      for (const [slug, filters] of Object.entries(catFilters)) {
        if (filters.filter1?.length) filters.filter1.forEach(v => params.append(`cat_${slug}_filter1`, v))
        if (filters.filter2?.length) filters.filter2.forEach(v => params.append(`cat_${slug}_filter2`, v))
        if (filters.filter3?.length) filters.filter3.forEach(v => params.append(`cat_${slug}_filter3`, v))
        if (filters.filter4?.length) filters.filter4.forEach(v => params.append(`cat_${slug}_filter4`, v))
        if (filters.filter5?.length) filters.filter5.forEach(v => params.append(`cat_${slug}_filter5`, v))
        if (filters.scales?.length) filters.scales.forEach(v => params.append(`cat_${slug}_scale`, v))
      }
    } else {
      activeFilters.filter1.forEach(v => params.append('filter1', v))
      activeFilters.filter2.forEach(v => params.append('filter2', v))
      activeFilters.filter3.forEach(v => params.append('filter3', v))
      activeFilters.filter4.forEach(v => params.append('filter4', v))
      activeFilters.filter5.forEach(v => params.append('filter5', v))
      activeFilters.scales.forEach(v => params.append('scale', v))
    }

    const res = await fetch(`/api/products?${params.toString()}`)
    const data = await res.json()
    setProducts(data.products)
    setTotal(data.total)
    setTotalPages(data.totalPages)
    if (data.availableFilters) setAvailableTags(data.availableFilters.tags || [])
    setLoading(false)
    router.push(`/catalog?${params.toString()}`, { scroll: false })
  }, [page, sortBy, priceMax, activeFilters, router])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (filtered: Product[], filters: FilterState) => {
    const prevCategories = activeFilters.categories
    const newCategories = filters.categories
    if (JSON.stringify(prevCategories) !== JSON.stringify(newCategories)) {
      fetchStaticFilters(newCategories.length > 0 ? newCategories : undefined).then(() => {
        setActiveFilters(prev => {
          const updated = { ...prev }
          const filterKeys = ['filter1', 'filter2', 'filter3', 'filter4', 'filter5', 'scales'] as const
          filterKeys.forEach(key => {
            const available = staticFilterOptions[key] || []
            const currentValues = (updated as any)[key] as string[] | undefined
            if (Array.isArray(currentValues)) {
              (updated as any)[key] = currentValues.filter((v: string) => available.includes(v))
            }
          })
          return updated
        })
      })
    }
    setActiveFilters(filters)
    setPage(1)
  }

  const handleSortChange = (value: string) => { setSortBy(value); setPage(1) }
  const handlePageChange = (newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleClearAllFilters = () => {
    setActiveFilters({
      categories: [], filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
      tags: [], scales: [],
      gameSystems: [], factions: [], types: [], fileFormats: [],
      categoryFilters: {},
    })
    setPriceMax(3500); setTempPrice(3500); setPage(1)
    fetchStaticFilters()
  }

  const handleRemoveFilter = (key: keyof FilterState, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).filter(v => v !== value)
    }))
    setPage(1)
  }

  const handlePriceChange = (value: number) => setTempPrice(value)
  const handlePriceCommit = () => setPriceMax(tempPrice)

  const activeFiltersCount =
    activeFilters.categories.length +
    activeFilters.filter1.length +
    activeFilters.filter2.length +
    activeFilters.filter3.length +
    activeFilters.filter4.length +
    activeFilters.filter5.length +
    activeFilters.tags.length +
    activeFilters.scales.length

  const openMobileFilter = () => {
    setTempFilters({ ...activeFilters })
    setIsFilterOpen(true)
  }

  const applyMobileFilters = () => {
    const prevCategories = activeFilters.categories
    const newCategories = tempFilters.categories
    const needFetch = JSON.stringify(prevCategories) !== JSON.stringify(newCategories)

    const apply = (updatedFilters: FilterState) => {
      setActiveFilters(updatedFilters)
      setPage(1)
      setIsFilterOpen(false)
    }

    if (needFetch) {
      fetchStaticFilters(newCategories.length > 0 ? newCategories : undefined).then(() => {
        apply(tempFilters)
      })
    } else {
      apply(tempFilters)
    }
  }

  const closeMobileFilter = () => setIsFilterOpen(false)

  const toggleMobileSection = (section: string) => {
    setMobileExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const applySortAndClose = () => { setPriceMax(tempPrice); setIsSortOpen(false) }

  const MobileFilterSection = ({
    title, sectionKey, options, selected, onToggle, paginated = false
  }: {
    title: string; sectionKey: string; options: { value: string; label: string }[];
    selected: string[]; onToggle: (value: string) => void; paginated?: boolean
  }) => {
    const isExpanded = mobileExpandedSections[sectionKey]
    const [page, setPage] = useState(1)
    const perPage = 10
    const totalPages = Math.ceil(options.length / perPage)
    const visibleOptions = paginated ? options.slice((page - 1) * perPage, page * perPage) : options

    return (
      <div className="border-b border-borderLight pb-3">
        <button onClick={() => toggleMobileSection(sectionKey)} className="flex justify-between items-center w-full text-left py-2 text-white font-medium">
          <span>{title}</span>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {visibleOptions.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => onToggle(opt.value)} className="rounded border-gray-500" />
                <span>{opt.label}</span>
              </label>
            ))}
            {paginated && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                <span className="text-xs text-gray-400">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Строим секции для мобильного фильтра (без префиксов категорий)
  const useCategoryFilters = tempFilters.categories.length > 1 && categoryFilterGroups.length > 0
  const mobileFilterSections: Array<{
    key: string; title: string; options: string[]; selected: string[]; categorySlug?: string; paginated?: boolean
  }> = []

  mobileFilterSections.push({
    key: 'categories', title: 'Категория',
    options: categories,
    selected: tempFilters.categories,
  })

  if (tempFilters.categories.length > 0) {
    if (useCategoryFilters) {
      for (const group of categoryFilterGroups) {
        const opts = categoryFilterOptions[group.categorySlug]
        if (!opts) continue
        const names = categoryFilterNames[group.categorySlug] || {}
        const addSection = (field: 'filter1' | 'filter2' | 'filter3' | 'filter4' | 'filter5', nameKey: string, index: number) => {
          const optionsArr = opts[field]
          if (optionsArr && optionsArr.length > 0) {
            mobileFilterSections.push({
              key: `${field}_${group.categorySlug}`,
              title: (names as any)[nameKey] || group[nameKey as keyof typeof group] || `Фильтр ${index}`,
              options: optionsArr,
              selected: (tempFilters.categoryFilters?.[group.categorySlug]?.[field] as string[]) || [],
              categorySlug: group.categorySlug,
            })
          }
        }
        addSection('filter1', 'filter1Name', 1)
        addSection('filter2', 'filter2Name', 2)
        addSection('filter3', 'filter3Name', 3)
        addSection('filter4', 'filter4Name', 4)
        addSection('filter5', 'filter5Name', 5)
      }
      if (staticFilterOptions.scales.length >= 2) {
        mobileFilterSections.push({
          key: 'scales',
          title: 'Масштаб',
          options: staticFilterOptions.scales,
          selected: tempFilters.scales,
        })
      }
    } else {
      const addGlobal = (key: 'filter1'|'filter2'|'filter3'|'filter4'|'filter5', index: number) => {
        const options = staticFilterOptions[key] || []
        if (options.length > 0) {
          mobileFilterSections.push({
            key,
            title: filterNames?.[`filter${index}Name` as keyof typeof filterNames] || `Фильтр ${index}`,
            options,
            selected: tempFilters[key],
          })
        }
      }
      addGlobal('filter1', 1)
      addGlobal('filter2', 2)
      addGlobal('filter3', 3)
      addGlobal('filter4', 4)
      addGlobal('filter5', 5)
      if (staticFilterOptions.scales.length >= 2) {
        mobileFilterSections.push({
          key: 'scales',
          title: 'Масштаб',
          options: staticFilterOptions.scales,
          selected: tempFilters.scales,
        })
      }
    }
  }

  mobileFilterSections.push({
    key: 'tags', title: 'Теги',
    options: availableTags,
    selected: tempFilters.tags,
    paginated: true,
  })

  return (
    <div className="overflow-x-hidden">
      {/* Десктоп */}
      <div className="hidden lg:block">
        <div className="max-w-screen-2xl mx-auto lg:max-w-none lg:ml-[2vw]">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
        </div>
        <div className="mt-2 w-full">
          <div className="flex w-full">
            <div className="w-[15vw] flex-shrink-0">
              <aside className="fixed left-[2vw] top-[120px] w-[13vw] z-20 pr-4">
                <div className="max-h-[calc(100vh-140px)] overflow-y-auto">
                  <FilterPanel
                    products={products}
                    onFilter={handleFilterChange}
                    hidePriceSlider={true}
                    allCategories={categories}
                    allFilterOptions={staticFilterOptions}
                    availableTags={availableTags}
                    categoryNames={categoryNames}
                    activeFilters={activeFilters}
                    filterNames={filterNames}
                    categoryFilterGroups={categoryFilterGroups}
                    categoriesData={categoriesData}
                    categoryFilterOptions={categoryFilterOptions}
                    categoryFilterNames={categoryFilterNames}
                  />
                </div>
              </aside>
            </div>

            <main className="mx-auto w-[70vw] px-4 pb-8">
              <ActiveFilters filters={activeFilters} onRemove={handleRemoveFilter} onClearAll={handleClearAllFilters} categoryNames={categoryNames} />
              {loading ? (
                <div className="text-center py-20 text-white">Загрузка...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Товары не найдены</div>
              ) : (
                <div className="grid grid-cols-3 gap-[1.25%] auto-rows-fr">
                  {products.map(product => <ProductCard key={product.article} product={product} />)}
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-24 mb-24">
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
                </div>
              )}
            </main>

            <div className="w-[15vw] flex-shrink-0">
              <aside className="fixed right-[2vw] top-[120px] w-[13vw] z-20 pl-4">
                <div className="p-4 flex flex-col" style={{ minHeight: '200px' }}>
                  <div>
                    <h3 className="text-white font-normal text-sm mb-2">Упорядочить:</h3>
                    <SortDropdown onSort={handleSortChange} />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-white font-normal text-sm mb-2">Цена до: {tempPrice} ₽</h3>
                    <input type="range" min={0} max={3500} step={10} value={tempPrice} onChange={(e) => handlePriceChange(Number(e.target.value))} onMouseUp={handlePriceCommit} onKeyUp={(e) => e.key === 'Enter' && handlePriceCommit()} className="w-full accent-white" style={{ colorScheme: 'light' }} />
                  </div>
                  <div className="mt-auto pt-4">
                    <p className="text-white font-semibold text-lg">{total} товаров</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Мобильная версия */}
      <div className="lg:hidden">
        <div className="fixed top-14 left-0 w-full bg-darkbg z-40 pt-3 pb-2 px-4">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start relative">
              <button onClick={openMobileFilter} className="text-white font-medium border-[1.5px] border-white rounded-full px-5 py-1.5 text-sm">
                Фильтры
              </button>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button onClick={() => setIsSortOpen(true)} className="justify-self-center text-white font-medium border-[1.5px] border-white rounded-full px-5 py-1.5 text-sm">
              Порядок
            </button>
            <div className="justify-self-end text-white font-semibold text-sm">
              Товаров: {total}
            </div>
          </div>
        </div>

        <div className="pt-24">
          {loading ? (
            <div className="text-center py-20 text-white">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Товары не найдены</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
              {products.map(product => <ProductCard key={product.article} product={product} />)}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-8 pb-20 flex justify-center">
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
            </div>
          )}
        </div>

        {isFilterOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 overflow-auto" onClick={closeMobileFilter}>
            <div className="bg-darkbg min-h-screen p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Фильтры</h2>
                <button onClick={closeMobileFilter} className="text-white"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                {mobileFilterSections.map(section => (
                  <MobileFilterSection
                    key={section.key}
                    title={section.title}
                    sectionKey={section.key}
                    options={section.options.map(opt => ({ value: opt, label: opt }))}
                    selected={section.selected}
                    onToggle={(value) => {
                      if (section.key === 'categories') {
                        // При изменении категорий сразу подгружаем фильтры, не ждём "Применить"
                        setTempFilters(prev => {
                          const newCategories = prev.categories.includes(value)
                            ? prev.categories.filter(v => v !== value)
                            : [...prev.categories, value]
                          // Запускаем загрузку соответствующих фильтров
                          fetchStaticFilters(newCategories.length > 0 ? newCategories : undefined)
                          return {
                            ...prev,
                            categories: newCategories,
                          }
                        })
                      } else if (section.categorySlug) {
                        setTempFilters(prev => {
                          const currentCatFilters = prev.categoryFilters || {}
                          const cat = section.categorySlug!
                          const field = section.key.split('_')[0] as keyof typeof currentCatFilters[string]
                          const currentValues = (currentCatFilters[cat]?.[field] as string[]) || []
                          const newValues = currentValues.includes(value)
                            ? currentValues.filter(v => v !== value)
                            : [...currentValues, value]
                          return {
                            ...prev,
                            categoryFilters: {
                              ...currentCatFilters,
                              [cat]: {
                                ...currentCatFilters[cat],
                                [field]: newValues,
                              }
                            }
                          }
                        })
                      } else {
                        setTempFilters(prev => ({
                          ...prev,
                          [section.key]: (prev[section.key as keyof FilterState] as string[]).includes(value)
                            ? (prev[section.key as keyof FilterState] as string[]).filter(v => v !== value)
                            : [...(prev[section.key as keyof FilterState] as string[]), value]
                        }))
                      }
                    }}
                    paginated={section.paginated}
                  />
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setTempFilters({
                      categories: [], filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
                      tags: [], scales: [],
                      gameSystems: [], factions: [], types: [], fileFormats: [],
                      categoryFilters: {},
                    })
                  }}
                  className="text-gray-400 hover:text-white underline"
                >
                  Сбросить фильтры
                </button>
                <button onClick={applyMobileFilters} className="flex-1 bg-white text-darkbg py-3 rounded-lg font-semibold">
                  Применить
                </button>
              </div>
            </div>
          </div>
        )}

        {isSortOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 overflow-auto" onClick={() => setIsSortOpen(false)}>
            <div className="bg-darkbg min-h-screen p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Сортировка и цена</h2>
                <button onClick={() => setIsSortOpen(false)} className="text-white"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-normal text-sm mb-2">Упорядочить:</h3>
                  <SortDropdown onSort={handleSortChange} />
                </div>
                <div>
                  <h3 className="text-white font-normal text-sm mb-2">Цена до: {tempPrice} ₽</h3>
                  <input type="range" min={0} max={3500} step={10} value={tempPrice} onChange={(e) => handlePriceChange(Number(e.target.value))} className="w-full accent-white" style={{ colorScheme: 'light' }} />
                </div>
              </div>
              <button onClick={applySortAndClose} className="mt-6 w-full bg-white text-darkbg py-3 rounded-lg font-semibold">Применить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}