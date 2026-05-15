// components/catalog/DesktopCatalog.tsx
'use client'

import { ProductCard } from '@/components/catalog/ProductCard'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import { SortDropdown } from '@/components/catalog/SortDropdown'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import Pagination from '@/components/catalog/Pagination'
import DualRangeSlider from '@/components/ui/DualRangeSlider'
import type { Product } from '@/types'
import type { FilterState, FilterConfigItem } from '@/components/catalog/FilterPanel'

interface DesktopCatalogProps {
  products: Product[]
  total: number
  totalPages: number
  page: number
  loading: boolean
  filters: FilterState
  onRemoveFilter: (key: keyof FilterState, value: string) => void
  onClearAll: () => void
  onSortChange: (sort: string) => void
  onPageChange: (page: number) => void
  onPageChangeWithScroll: (page: number) => void
  allCategories: string[]
  categoryNames: Record<string, string>
  filterConfigSections: FilterConfigItem[]
  showOnlySale: boolean
  onToggleSale: () => void
  minVal: number
  maxVal: number
  globalMinPrice: number
  globalMaxPrice: number
  onMinChange: (val: number) => void
  onMaxChange: (val: number) => void
  onPriceInputMin: (val: number) => void
  onPriceInputMax: (val: number) => void
  onFilterChange: (filtered: Product[], filters: FilterState) => void
  filterCounts: Record<string, Record<string, number>>
}

export default function DesktopCatalog({
  products, total, totalPages, page, loading,
  filters, onRemoveFilter, onClearAll, onSortChange,
  onPageChange, onPageChangeWithScroll,
  allCategories, categoryNames, filterConfigSections,
  showOnlySale, onToggleSale,
  minVal, maxVal, globalMinPrice, globalMaxPrice,
  onMinChange, onMaxChange, onPriceInputMin, onPriceInputMax,
  onFilterChange, filterCounts,
}: DesktopCatalogProps) {
  return (
    <div className="hidden lg:block">
      <div className="max-w-screen-2xl mx-auto lg:max-w-none lg:ml-[2vw]">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
      </div>
      <div className="mt-2 w-full">
        <div className="flex w-full">
          <div className="w-[15vw] flex-shrink-0 self-start">
            <div className="sticky top-[120px] z-20 pr-4 ml-[2vw]">
              <FilterPanel
                products={products}
                onFilter={onFilterChange}
                hidePriceSlider={true}
                allCategories={allCategories}
                categoryNames={categoryNames}
                activeFilters={filters}
                filterConfigSections={filterConfigSections}
                showOnlySale={showOnlySale}
                onToggleSale={onToggleSale}
                filterCounts={filterCounts}
              />
            </div>
          </div>

          <main className="mx-auto w-[70vw] px-4 pb-8">
            <ActiveFilters
              filters={filters}
              onRemove={onRemoveFilter}
              onClearAll={onClearAll}
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
                  onPageChange={onPageChange}
                  onPageChangeWithScroll={onPageChangeWithScroll}
                />
              </div>
            )}
          </main>

          <div className="w-[15vw] flex-shrink-0 self-start">
            <div className="sticky top-[120px] z-20 pl-4 mr-[2vw]">
              <div className="p-4 flex flex-col" style={{ minHeight: '200px' }}>
                <div>
                  <h3 className="text-white font-normal text-sm mb-2">Упорядочить:</h3>
                  <SortDropdown onSort={onSortChange} />
                </div>
                <div className="mt-6">
                  <h3 className="text-white font-normal text-sm mb-2">
                    Цена: {minVal} – {maxVal} ₽
                  </h3>
                  <DualRangeSlider
                    min={globalMinPrice}
                    max={globalMaxPrice}
                    minValue={minVal}
                    maxValue={maxVal}
                    onMinChange={onMinChange}
                    onMaxChange={onMaxChange}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min={globalMinPrice}
                      max={globalMaxPrice}
                      value={minVal}
                      onChange={e => onPriceInputMin(Number(e.target.value))}
                      placeholder="От, ₽"
                      className="w-full px-2 py-1 text-sm bg-[#0f2a42] border border-borderLight rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="number"
                      min={globalMinPrice}
                      max={globalMaxPrice}
                      value={maxVal}
                      onChange={e => onPriceInputMax(Number(e.target.value))}
                      placeholder="До, ₽"
                      className="w-full px-2 py-1 text-sm bg-[#0f2a42] border border-borderLight rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <p className="text-white font-semibold text-lg">{total} товаров</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}