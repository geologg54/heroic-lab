// app/catalog/page.tsx
'use client'
import { useState, useMemo, useCallback } from 'react'
import { products } from '@/lib/data'
import { ProductCard } from '@/components/catalog/ProductCard'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { SortDropdown } from '@/components/catalog/SortDropdown'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import Pagination from '@/components/catalog/Pagination'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'

export default function CatalogPage() {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [activeFiltersObj, setActiveFiltersObj] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const handleFilterChange = useCallback((filtered: typeof products, activeFilters: any) => {
    setFilteredProducts(filtered)
    setCurrentPage(1)
    // Преобразуем активные фильтры в формат для ActiveFilters
    const newActive: Record<string, string[]> = {}
    for (const key in activeFilters) {
      if (Array.isArray(activeFilters[key]) && activeFilters[key].length > 0) {
        newActive[key] = activeFilters[key]
      }
    }
    setActiveFiltersObj(newActive)
  }, [])

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'popularity') list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    else if (sortBy === 'date') list.sort((a, b) => {
      const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0
      const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0
      return dateB - dateA
    })
    return list
  }, [filteredProducts, sortBy])

  const paginated = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  const handleRemoveFilter = (key: string, value: string) => {
    // TODO: реализовать снятие фильтра через FilterPanel
    // Для простоты перезагрузим страницу или сбросим все фильтры
    // Но лучше поднять состояние фильтров выше, это потребует рефакторинга
    alert('Снятие фильтров в разработке. Используйте кнопку "Сбросить все" в панели фильтров.')
  }

  const handleClearAllFilters = () => {
    // Перезагружаем все товары и сбрасываем активные фильтры
    setFilteredProducts(products)
    setActiveFiltersObj({})
    // Нужно также сбросить состояние в FilterPanel, но это сложно из-за внутреннего состояния.
    // Лучше перезагрузить страницу
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        <aside className="lg:w-1/4">
          <FilterPanel products={products} onFilter={handleFilterChange} />
        </aside>
        <main className="lg:w-3/4">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <SortDropdown onSort={setSortBy} products={sortedProducts} />
            <span className="text-gray-400 text-sm">Найдено: {sortedProducts.length}</span>
          </div>
          <ActiveFilters filters={activeFiltersObj} onRemove={handleRemoveFilter} onClearAll={handleClearAllFilters} />
          {paginated.length === 0 ? (
            <div className="text-center py-20 text-gray-400">🧙‍♂️ Товары не найдены. Попробуйте изменить фильтры.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
          {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />}
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