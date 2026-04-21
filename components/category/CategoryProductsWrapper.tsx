// components/category/CategoryProductsWrapper.tsx
'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/catalog/ProductCard'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { SortDropdown } from '@/components/catalog/SortDropdown'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import Pagination from '@/components/catalog/Pagination'
import type { Product } from '@/types'

interface CategoryProductsWrapperProps {
  products: Product[]
  filterNames?: {
    filter1Name?: string | null
    filter2Name?: string | null
    filter3Name?: string | null
    filter4Name?: string | null
    filter5Name?: string | null
  }
}

export default function CategoryProductsWrapper({ products: initialProducts, filterNames = {} }: CategoryProductsWrapperProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price
      case 'price-desc': return b.price - a.price
      case 'name': return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  const handleFilter = (filtered: Product[], filters: any) => {
    setFilteredProducts(filtered)
    setActiveFilters(filters)
    setCurrentPage(1)
  }

  const handleClearAll = () => {
    setFilteredProducts(initialProducts)
    setActiveFilters({})
    setCurrentPage(1)
  }

  const handleRemoveFilter = (key: string, value: string) => {
    // Здесь нужно реализовать снятие конкретного фильтра, но для простоты сбросим всё
    handleClearAll()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-1/4">
        <FilterPanel 
          products={initialProducts} 
          onFilter={handleFilter} 
          filterNames={filterNames}
        />
      </aside>
      <main className="lg:w-3/4">
        <div className="flex justify-between items-center mb-4">
          <SortDropdown onSort={setSortBy} />
          <span className="text-gray-400">{filteredProducts.length} моделей</span>
        </div>
        <ActiveFilters
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Товары не найдены</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.article} product={product} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  )
}