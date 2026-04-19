// app/catalog/CatalogContent.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/catalog/ProductCard'
import { FilterPanel, FilterContent } from '@/components/catalog/FilterPanel'
import type { FilterState } from '@/components/catalog/FilterPanel'
import { SortDropdown } from '@/components/catalog/SortDropdown'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import Pagination from '@/components/catalog/Pagination'
import type { Product } from '@/types'
import { X } from 'lucide-react'

interface CatalogContentProps {
  initialProducts: Product[]
  initialTotal: number
  initialPage: number
  totalPages: number
  categories: string[]
}

export default function CatalogContent({
  initialProducts,
  initialTotal,
  initialPage,
  totalPages: initialTotalPages,
}: CatalogContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    gameSystems: [],
    factions: [],
    types: [],
    scales: [],
    fileFormats: [],
    tags: []
  })
  const MAX_PRICE = 3500
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [tempPrice, setTempPrice] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('newest')

  // Для мобильных модальных окон
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Локальное состояние для секций фильтров в мобильной модалке
  const [mobileFilterExpanded, setMobileFilterExpanded] = useState<Record<string, boolean>>({
    categories: false,
    subcategories: false,
    gameSystems: false,
    factions: false,
    types: false,
    scales: false,
    fileFormats: false,
    tags: false,
  })

  const toggleMobileSection = (section: string) => {
    setMobileFilterExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

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
    if (activeFilters.gameSystems.length) {
      activeFilters.gameSystems.forEach(s => params.append('gameSystem', s))
    }
    if (activeFilters.scales.length) {
      activeFilters.scales.forEach(s => params.append('scale', s))
    }
    if (activeFilters.types.length) {
      activeFilters.types.forEach(t => params.append('type', t))
    }

    const res = await fetch(`/api/products?${params.toString()}`)
    const data = await res.json()
    setProducts(data.products)
    setTotal(data.total)
    setTotalPages(data.totalPages)
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
      subcategories: [],
      gameSystems: [],
      factions: [],
      types: [],
      scales: [],
      fileFormats: [],
      tags: []
    })
    setPriceMax(MAX_PRICE)
    setTempPrice(MAX_PRICE)
    setPage(1)
  }

  const handleRemoveFilter = (key: keyof FilterState, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).filter(v => v !== value)
    }))
    setPage(1)
  }

  const handlePriceChange = (value: number) => {
    setTempPrice(value)
  }

  const handlePriceCommit = () => {
    setPriceMax(tempPrice)
  }

  const applySortAndClose = () => {
    setPriceMax(tempPrice)
    setIsSortOpen(false)
  }

  return (
    <div className="overflow-x-hidden">
      {/* Десктопная версия */}
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
                  />
                </div>
              </aside>
            </div>

            <main className="mx-auto w-[70vw] px-4 pb-8">
              <ActiveFilters
                filters={activeFilters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
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

      {/* Мобильная версия */}
      <div className="lg:hidden">
        {/* Фиксированная панель под шапкой */}
       <div className="fixed top-14 left-0 w-full bg-darkbg z-40 pt-3 pb-2 px-4">
        <div className="grid grid-cols-3 items-center">
          <div className="justify-self-start relative">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="text-white font-medium border border-white rounded-full px-4 py-1"
            >
              Фильтры
            </button>
            {/* Индикатор количества активных фильтров */}
            {(() => {
              const activeCount = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
              return activeCount > 0 ? (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeCount}
                </span>
              ) : null;
            })()}
          </div>
          <button
            onClick={() => setIsSortOpen(true)}
            className="justify-self-center text-white font-medium border border-white rounded-full px-4 py-1"
          >
            Порядок
          </button>
          <div className="justify-self-end text-white font-semibold">
            Товаров: {total}
          </div>
        </div>
      </div>

        {/* Сетка товаров */}
        <div className="pt-28">
          {loading ? (
            <div className="text-center py-20 text-white">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Товары не найдены</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
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

        {/* Модальное окно фильтров */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 overflow-auto">
            <div className="bg-darkbg min-h-screen p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Фильтры</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-white">
                  <X size={24} />
                </button>
              </div>
             
              <FilterContent
                products={products}
                filters={activeFilters}
                setFilters={(newFilters) => {
                  setActiveFilters(newFilters);
                  setPage(1);
                }}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                expandedSections={mobileFilterExpanded}
                toggleSection={toggleMobileSection}
                toggleFilter={(key, value) => {
                  setActiveFilters(prev => ({
                    ...prev,
                    [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
                  }))
                }}
                resetFilters={handleClearAllFilters}
                hidePriceSlider={true}
                showActiveFilters={true}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
              />
              <button
                onClick={() => setIsFilterOpen(false)}
                className="mt-6 w-full bg-white text-darkbg py-3 rounded-lg font-semibold"
              >
                Применить
              </button>
            </div>
          </div>
        )}

        {/* Модальное окно сортировки и цены */}
        {isSortOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 overflow-auto">
            <div className="bg-darkbg min-h-screen p-4">
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