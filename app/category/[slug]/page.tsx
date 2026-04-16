'use client'

import { useParams } from 'next/navigation'
import { products, categories } from '@/lib/data'
import { ProductCard } from '@/components/catalog/ProductCard'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { SortDropdown } from '@/components/catalog/SortDropdown'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import Pagination from '@/components/catalog/Pagination'
import { useState, useCallback, useMemo, useRef } from 'react'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const category = categories.find(c => c.slug === slug)
  if (!category) {
    return <div className="container mx-auto px-4 py-8 text-white">Категория не найдена</div>
  }

  const categoryProducts = useMemo(() => products.filter(p => p.categorySlug === slug), [slug])
  const subcategories = useMemo(
    () => [...new Set(categoryProducts.filter(p => p.subcategory).map(p => p.subcategory))],
    [categoryProducts]
  )

  const [filteredProducts, setFilteredProducts] = useState(categoryProducts)
  const [activeFilters, setActiveFilters] = useState({})
  const [sortBy, setSortBy] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const lastFilteredRef = useRef(categoryProducts)

  const handleFilter = useCallback((filtered: typeof products, filters: any) => {
    // Если результат фильтрации не изменился, не обновляем состояние
    if (JSON.stringify(filtered) === JSON.stringify(lastFilteredRef.current)) {
      return
    }
    lastFilteredRef.current = filtered
    setFilteredProducts(filtered)
    setActiveFilters(filters)
    setCurrentPage(1)
  }, [])

  const handleSort = useCallback((value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }, [])

  const handleRemoveFilter = useCallback(() => {
    window.location.reload()
  }, [])

  const handleClearAllFilters = useCallback(() => {
    window.location.reload()
  }, [])

  const sorted = useMemo(() => {
    let result = [...filteredProducts]
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price)
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [filteredProducts, sortBy])

  const paginated = useMemo(
    () => sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [sorted, currentPage]
  )
  const totalPages = Math.ceil(sorted.length / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: category.name },
        ]}
      />

      <div className="relative rounded-xl overflow-hidden my-6 bg-gradient-to-r from-[#0a2a3f] to-[#05192C] p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
        <p className="text-gray-300 mt-2 max-w-2xl">
          Исследуйте {categoryProducts.length} моделей в этой категории. Цифровые файлы для 3D печати.
        </p>
        {category.image && (
          <div className="absolute right-0 top-0 opacity-20">
            <img src={category.image} alt="" className="h-full object-cover" />
          </div>
        )}
      </div>

      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Подкатегории</h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <a
                key={sub}
                href={`#${sub}`}
                className="px-4 py-2 bg-cardbg border border-borderLight rounded-full text-gray-300 hover:text-white hover:border-accent"
              >
                {sub}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <FilterPanel products={categoryProducts} onFilter={handleFilter} />
        </aside>
        <main className="lg:w-3/4">
          <div className="flex justify-between mb-4">
            <SortDropdown onSort={handleSort} products={sorted} />
            <span className="text-gray-400">{sorted.length} моделей</span>
          </div>
          <ActiveFilters
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          )}
        </main>
      </div>
    </div>
  )
}