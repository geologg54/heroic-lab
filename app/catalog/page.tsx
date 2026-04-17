'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ProductCard } from '@/components/catalog/ProductCard'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import type { FilterState } from '@/components/catalog/FilterPanel'  // импортируем тип из FilterPanel
import { SortDropdown } from '@/components/catalog/SortDropdown'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import Pagination from '@/components/catalog/Pagination'
import { fetchAllProducts } from '@/lib/api'
import type { Product } from '@/types'

export default function CatalogPage() {
  // Явно указываем типы для всех состояний
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [activeFiltersObj, setActiveFiltersObj] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState<string>('default')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const itemsPerPage = 9

  // Загружаем товары при монтировании
  useEffect(() => {
    fetchAllProducts()
      .then((data: Product[]) => {
        setAllProducts(data)
        setFilteredProducts(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        console.error('Ошибка загрузки товаров:', err)
        setLoading(false)
      })
  }, [])

  // Обработчик изменения фильтров
  const handleFilterChange = useCallback((filtered: Product[], activeFilters: FilterState) => {
    setFilteredProducts(filtered)
    setCurrentPage(1)
    // Преобразуем FilterState в Record<string, string[]> для компонента ActiveFilters
    const newActive: Record<string, string[]> = {}
    for (const key in activeFilters) {
      const value = activeFilters[key as keyof FilterState]
      if (Array.isArray(value) && value.length > 0) {
        newActive[key] = value
      }
    }
    setActiveFiltersObj(newActive)
  }, [])

  // Сортировка товаров
  const sortedProducts = useMemo<Product[]>(() => {
    const list = [...filteredProducts]
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popularity':
        list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        break
      case 'date':
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        break
      default:
        break
    }
    return list
  }, [filteredProducts, sortBy])

  // Пагинация
  const paginated = useMemo<Product[]>(() => {
    return sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [sortedProducts, currentPage])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  // Заглушки для обработчиков фильтров (пока просто перезагрузка)
  const handleRemoveFilter = (key: string, value: string) => {
    window.location.reload()
  }

  const handleClearAllFilters = () => {
    window.location.reload()
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-white">Загрузка товаров...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        <aside className="lg:w-1/4">
          <FilterPanel products={allProducts} onFilter={handleFilterChange} />
        </aside>
        <main className="lg:w-3/4">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <SortDropdown onSort={setSortBy} products={sortedProducts} />
            <span className="text-gray-400 text-sm">Найдено: {sortedProducts.length}</span>
          </div>
          <ActiveFilters
            filters={activeFiltersObj}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
          {paginated.length === 0 ? (
            <div className="text-center py-20 text-gray-400">🧙‍♂️ Товары не найдены. Попробуйте изменить фильтры.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          )}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-4">Коллекции по теме</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-cardbg p-4 rounded-xl border border-borderLight hover:border-accent transition">
                <h3 className="text-white font-semibold">Армии Империума</h3>
                <p className="text-gray-400 text-sm">Космодесант, Адептус Механикус, Имперская Гвардия</p>
              </div>
              <div className="bg-cardbg p-4 rounded-xl border border-borderLight hover:border-accent transition">
                <h3 className="text-white font-semibold">Траншейные войны</h3>
                <p className="text-gray-400 text-sm">Модели для Trench Crusade и альтернативной истории</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}