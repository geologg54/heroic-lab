// components/catalog/CatalogContent.tsx
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
  // Фиксированная максимальная цена для ползунка
  const MAX_PRICE = 3500
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [tempPrice, setTempPrice] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('newest')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    if (sortBy !== 'newest') params.set('sort', sortBy) // изменено условие
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

  return (
    <div className="overflow-x-hidden">
      {/* Хлебные крошки */}
      <div className="hidden lg:block max-w-screen-2xl mx-auto lg:max-w-none lg:ml-[2vw]">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
      </div>
      <div className="lg:hidden px-4">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
      </div>

      {/* ДЕСКТОПНАЯ ВЕРСИЯ */}
      <div className="hidden lg:block mt-2 w-full">
        <div className="flex w-full">
          {/* ЛЕВЫЙ САЙДБАР (ФИЛЬТРЫ) */}
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

          {/* ЦЕНТРАЛЬНЫЙ БЛОК (СЕТКА ТОВАРОВ) */}
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

          {/* ПРАВЫЙ САЙДБАР (СОРТИРОВКА + ПОЛЗУНОК + КОЛИЧЕСТВО) */}
          <div className="w-[15vw] flex-shrink-0">
            <aside className="fixed right-[2vw] top-[120px] w-[13vw] z-20 pl-4">
              <div className="bg-cardbg p-4 flex flex-col" style={{ minHeight: '200px' }}>
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

      {/* МОБИЛЬНАЯ ВЕРСИЯ */}
      <div className="lg:hidden mt-6">
        <div className="px-4">
          <FilterPanel products={products} onFilter={handleFilterChange} />
        </div>
        <div className="mt-6">
          <div className="px-4 flex justify-between items-center mb-4 flex-wrap gap-4">
            <SortDropdown onSort={handleSortChange} />
            <span className="text-gray-400 text-sm">Найдено: {total}</span>
          </div>
          <div className="px-4">
            <ActiveFilters
              filters={activeFilters}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>
          {loading ? (
            <div className="text-center py-20 text-white">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Товары не найдены</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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