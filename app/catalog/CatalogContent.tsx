// app/catalog/CatalogContent.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

interface CatalogContentProps {
  initialProducts: Product[]
  initialTotal: number
  initialPage: number
  totalPages: number
  categories: string[]
  allFilterOptions: {
    categories: string[]
    filter1: string[]
    filter2: string[]
    filter3: string[]
    filter4: string[]
    filter5: string[]
    scales: string[]
  }
  categoryNames: Record<string, string>
}

export default function CatalogContent({
  initialProducts,
  initialTotal,
  initialPage,
  totalPages: initialTotalPages,
  categories,
  allFilterOptions,
  categoryNames,
}: CatalogContentProps) {
  const router = useRouter()
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
      tags: params.getAll('tags'),
      scales: params.getAll('scale'),
      gameSystems: [],
      factions: [],
      types: [],
      fileFormats: [],
    }
  }

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)

  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<FilterState>(getInitialFilters())

  const MAX_PRICE = 3500
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [tempPrice, setTempPrice] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('newest')

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const [tempFilters, setTempFilters] = useState<FilterState>(activeFilters)
  
  // Состояние раскрытия секций в мобильной модалке
  const [mobileExpandedSections, setMobileExpandedSections] = useState<Record<string, boolean>>({
    categories: false,
    filter1: false,
    filter2: false,
    filter3: false,
    filter4: false,
    filter5: false,
    tags: false,
    scales: false,
  })

  const filterPanelRef = useRef<{ resetFilters: () => void }>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (priceMax < MAX_PRICE) params.set('maxPrice', priceMax.toString())

    if (activeFilters.categories.length) {
      params.set('category', activeFilters.categories[0])
    }

    activeFilters.filter1.forEach(v => params.append('filter1', v))
    activeFilters.filter2.forEach(v => params.append('filter2', v))
    activeFilters.filter3.forEach(v => params.append('filter3', v))
    activeFilters.filter4.forEach(v => params.append('filter4', v))
    activeFilters.filter5.forEach(v => params.append('filter5', v))
    activeFilters.tags.forEach(v => params.append('tags', v))
    activeFilters.scales.forEach(v => params.append('scale', v))

    const res = await fetch(`/api/products?${params.toString()}`)
    const data = await res.json()
    setProducts(data.products)
    setTotal(data.total)
    setTotalPages(data.totalPages)

    if (data.availableFilters) {
      setAvailableTags(data.availableFilters.tags || [])
    }

    setLoading(false)
    router.push(`/catalog?${params.toString()}`, { scroll: false })
  }, [page, sortBy, priceMax, activeFilters, router])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (filtered: Product[], filters: FilterState) => {
    setActiveFilters(filters)
    setPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearAllFilters = () => {
    setActiveFilters({
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
    setPriceMax(MAX_PRICE)
    setTempPrice(MAX_PRICE)
    setPage(1)
  }

  const handleRemoveFilter = (key: keyof FilterState, value: string) => {
    setActiveFilters(prev => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.filter(v => v !== value)
      }
    })
    setPage(1)
  }

  const handlePriceChange = (value: number) => setTempPrice(value)
  const handlePriceCommit = () => setPriceMax(tempPrice)
  const applySortAndClose = () => {
    setPriceMax(tempPrice)
    setIsSortOpen(false)
  }

  const openMobileFilter = () => {
    setTempFilters({ ...activeFilters })
    setIsFilterOpen(true)
  }

  const applyMobileFilters = () => {
    setActiveFilters(tempFilters)
    setPage(1)
    setIsFilterOpen(false)
  }

  const closeMobileFilter = () => {
    setIsFilterOpen(false)
  }

  const toggleMobileSection = (section: string) => {
    setMobileExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const activeFiltersCount =
    activeFilters.categories.length +
    activeFilters.filter1.length +
    activeFilters.filter2.length +
    activeFilters.filter3.length +
    activeFilters.filter4.length +
    activeFilters.filter5.length +
    activeFilters.tags.length +
    activeFilters.scales.length

  // Компонент секции фильтра для мобильной модалки
  const MobileFilterSection = ({
    title,
    sectionKey,
    options,
    selected,
    onToggle,
    paginated = false
  }: {
    title: string
    sectionKey: string
    options: { value: string; label: string }[]
    selected: string[]
    onToggle: (value: string) => void
    paginated?: boolean
  }) => {
    const isExpanded = mobileExpandedSections[sectionKey]
    const [page, setPage] = useState(1)
    const perPage = 10

    const totalPages = Math.ceil(options.length / perPage)
    const visibleOptions = paginated
      ? options.slice((page - 1) * perPage, page * perPage)
      : options

    return (
      <div className="border-b border-borderLight pb-3">
        <button
          onClick={() => toggleMobileSection(sectionKey)}
          className="flex justify-between items-center w-full text-left py-2 text-white font-medium"
        >
          <span>{title}</span>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {visibleOptions.map(opt => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => onToggle(opt.value)}
                  className="rounded border-gray-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
            {paginated && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-400">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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

  return (
    <div className="overflow-x-hidden">
      {/* ДЕСКТОПНАЯ ВЕРСИЯ */}
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
                    allFilterOptions={allFilterOptions}
                    availableTags={availableTags}
                    categoryNames={categoryNames}
                    activeFilters={activeFilters}
                  />
                </div>
              </aside>
            </div>

            <main className="mx-auto w-[70vw] px-4 pb-8">
              <ActiveFilters
                filters={activeFilters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
                categoryNames={categoryNames}
              />
              {loading ? (
                <div className="text-center py-20 text-white">Загрузка...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Товары не найдены</div>
              ) : (
                <div className="grid grid-cols-3 gap-[1.25%] auto-rows-fr">
                  {products.map(product => (
                    <ProductCard key={product.article} product={product} />
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-24 mb-24">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={page}
                    onPageChange={handlePageChange}
                  />
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
                    <input
                      type="range"
                      min={0}
                      max={MAX_PRICE}
                      step={10}
                      value={tempPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      onMouseUp={handlePriceCommit}
                      onKeyUp={(e) => e.key === 'Enter' && handlePriceCommit()}
                      className="w-full accent-white"
                      style={{ colorScheme: 'light' }}
                    />
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

      {/* МОБИЛЬНАЯ ВЕРСИЯ */}
      <div className="lg:hidden">
        <div className="fixed top-14 left-0 w-full bg-darkbg z-40 pt-3 pb-2 px-4">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start relative">
              <button
                onClick={openMobileFilter}
                className="text-white font-medium border-[1.5px] border-white rounded-full px-5 py-1.5 text-sm"
              >
                Фильтры
              </button>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsSortOpen(true)}
              className="justify-self-center text-white font-medium border-[1.5px] border-white rounded-full px-5 py-1.5 text-sm"
            >
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
              {products.map(product => (
                <ProductCard key={product.article} product={product} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-8 pb-20 flex justify-center">
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Модальное окно фильтров (мобильное) */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 overflow-auto" onClick={closeMobileFilter}>
            <div className="bg-darkbg min-h-screen p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Фильтры</h2>
                <button onClick={closeMobileFilter} className="text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <MobileFilterSection
                  title="Категория"
                  sectionKey="categories"
                  options={categories.map(slug => ({ value: slug, label: categoryNames[slug] || slug }))}
                  selected={tempFilters.categories}
                  onToggle={(value) => {
                    setTempFilters(prev => ({
                      ...prev,
                      categories: prev.categories.includes(value)
                        ? prev.categories.filter(v => v !== value)
                        : [...prev.categories, value]
                    }))
                  }}
                />

                {(['filter1', 'filter2', 'filter3', 'filter4', 'filter5'] as const).map((key) => {
                  const options = allFilterOptions[key] || []
                  if (options.length === 0) return null
                  const titles: Record<string, string> = {
                    filter1: 'Фракция',
                    filter2: 'Тип',
                    filter3: 'Класс',
                    filter4: 'Материал',
                    filter5: 'Особенность'
                  }
                  return (
                    <MobileFilterSection
                      key={key}
                      sectionKey={key}
                      title={titles[key]}
                      options={options.map(opt => ({ value: opt, label: opt }))}
                      selected={tempFilters[key]}
                      onToggle={(value) => {
                        setTempFilters(prev => ({
                          ...prev,
                          [key]: prev[key].includes(value)
                            ? prev[key].filter(v => v !== value)
                            : [...prev[key], value]
                        }))
                      }}
                    />
                  )
                })}

                <MobileFilterSection
                  title="Теги"
                  sectionKey="tags"
                  options={availableTags.map(tag => ({ value: tag, label: tag }))}
                  selected={tempFilters.tags}
                  onToggle={(value) => {
                    setTempFilters(prev => ({
                      ...prev,
                      tags: prev.tags.includes(value)
                        ? prev.tags.filter(v => v !== value)
                        : [...prev.tags, value]
                    }))
                  }}
                  paginated={true}
                />

                {allFilterOptions.scales.length >= 2 && (
                  <MobileFilterSection
                    title="Масштаб"
                    sectionKey="scales"
                    options={allFilterOptions.scales.map(scale => ({ value: scale, label: scale }))}
                    selected={tempFilters.scales}
                    onToggle={(value) => {
                      setTempFilters(prev => ({
                        ...prev,
                        scales: prev.scales.includes(value)
                          ? prev.scales.filter(v => v !== value)
                          : [...prev.scales, value]
                      }))
                    }}
                  />
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setTempFilters({
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
                  }}
                  className="text-gray-400 hover:text-white underline"
                >
                  Сбросить фильтры
                </button>
                <button
                  onClick={applyMobileFilters}
                  className="flex-1 bg-white text-darkbg py-3 rounded-lg font-semibold"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно сортировки и цены */}
        {isSortOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 overflow-auto" onClick={() => setIsSortOpen(false)}>
            <div className="bg-darkbg min-h-screen p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Сортировка и цена</h2>
                <button onClick={() => setIsSortOpen(false)} className="text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-normal text-sm mb-2">Упорядочить:</h3>
                  <SortDropdown onSort={handleSortChange} />
                </div>
                <div>
                  <h3 className="text-white font-normal text-sm mb-2">Цена до: {tempPrice} ₽</h3>
                  <input
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    step={10}
                    value={tempPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full accent-white"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>
              <button
                onClick={applySortAndClose}
                className="mt-6 w-full bg-white text-darkbg py-3 rounded-lg font-semibold"
              >
                Применить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}