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
  const [priceMax, setPriceMax] = useState(2000)
  const [sortBy, setSortBy] = useState('default')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    if (sortBy !== 'default') params.set('sort', sortBy)
    if (priceMax < 2000) params.set('maxPrice', priceMax.toString())

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
    setPriceMax(2000)
    setPage(1)
  }

  const handleRemoveFilter = (key: keyof FilterState, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).filter(v => v !== value)
    }))
    setPage(1)
  }

  return (
    <div className="px-4 py-8 lg:px-0">
      {/* Хлебные крошки – с отступом слева как у фильтров */}
      <div className="max-w-screen-2xl mx-auto lg:max-w-none lg:ml-[1.5vw]">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
      </div>

      {/* ДЕСКТОПНАЯ ВЕРСИЯ */}
      <div className="hidden lg:block mt-6 w-full">
        <div className="flex w-full">
          {/* Левый блок (15% экрана) – внутри фильтры с отступом и меньшей шириной */}
          <div className="w-[15vw] flex-shrink-0">
            <aside className="ml-[1.5vw] w-[13.5vw]">
              <FilterPanel products={products} onFilter={handleFilterChange} />
            </aside>
          </div>

          {/* Центральный блок – сетка товаров (70% экрана) */}
          <main className="w-[70vw] flex-shrink-0 px-4">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <SortDropdown onSort={handleSortChange} products={products} />
              <span className="text-gray-400 text-sm">Найдено: {total}</span>
            </div>
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
              <div className="grid grid-cols-3 gap-[5%]">
                {products.map(product => (
                  <ProductCard key={product.article} product={product} />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={handlePageChange}
              />
            )}
          </main>

          {/* Правый блок (15% экрана) – пусто */}
          <div className="w-[15vw] flex-shrink-0"></div>
        </div>
      </div>

      {/* МОБИЛЬНАЯ ВЕРСИЯ (без изменений) */}
      <div className="lg:hidden mt-6">
        <FilterPanel products={products} onFilter={handleFilterChange} />
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <SortDropdown onSort={handleSortChange} products={products} />
            <span className="text-gray-400 text-sm">Найдено: {total}</span>
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map(product => (
                <ProductCard key={product.article} product={product} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}