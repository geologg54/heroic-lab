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

interface CatalogContentProps {
  initialProducts: Product[]
  initialTotal: number
  initialPage: number
  totalPages: number
  categories: string[]
  // Новый пропс – полный список опций для фильтров (кроме тегов)
  allFilterOptions: {
    categories: string[]
    filter1: string[]
    filter2: string[]
    filter3: string[]
    filter4: string[]
    filter5: string[]
    scales: string[]
  }
}

// Тип для availableFilters (те, что приходят с API – используются только для тегов)
interface AvailableFilters {
  tags: string[]
  // остальные поля нам не нужны, но оставим для совместимости
  categories?: string[]
  filter1?: string[]
  filter2?: string[]
  filter3?: string[]
  filter4?: string[]
  filter5?: string[]
  scales?: string[]
}

export default function CatalogContent({
  initialProducts,
  initialTotal,
  initialPage,
  totalPages: initialTotalPages,
  categories,
  allFilterOptions, // <-- новый пропс
}: CatalogContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)

  // Состояние для динамических тегов (получаем из API)
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Актуальные фильтры
  const [activeFilters, setActiveFilters] = useState<FilterState>({
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

  const MAX_PRICE = 3500
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('newest')

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
    
    // Сохраняем только доступные теги из ответа API
    if (data.availableFilters?.tags) {
      setAvailableTags(data.availableFilters.tags)
    } else {
      setAvailableTags([])
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
                    allCategories={categories}
                    // Передаём полные списки опций (кроме тегов)
                    allFilterOptions={allFilterOptions}
                    // Передаём динамические теги
                    availableTags={availableTags}
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
                    <h3 className="text-white font-normal text-sm mb-2">Цена до: {priceMax} ₽</h3>
                    <input
                      type="range"
                      min={0}
                      max={MAX_PRICE}
                      step={10}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
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
        <div className="pt-2">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
        </div>

        <div className="sticky top-14 z-30 bg-darkbg pt-3 pb-2 px-4 border-b border-borderLight">
          <div className="flex items-center justify-between">
            <FilterPanel
              products={products}
              onFilter={handleFilterChange}
              hidePriceSlider={true}
              allCategories={categories}
              allFilterOptions={allFilterOptions}
              availableTags={availableTags}
            />
            <div className="flex items-center gap-2">
              <SortDropdown onSort={handleSortChange} />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <ActiveFilters
              filters={activeFilters}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
            <div className="text-white text-sm">
              Цена до:{' '}
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={10}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-32 accent-white inline-block ml-2"
                style={{ colorScheme: 'light' }}
              />
              <span className="ml-2">{priceMax} ₽</span>
            </div>
          </div>
          <div className="text-right text-white text-sm mt-1">
            Товаров: {total}
          </div>
        </div>

        <div className="px-2">
          {loading ? (
            <div className="text-center py-20 text-white">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Товары не найдены</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>
    </div>
  )
}