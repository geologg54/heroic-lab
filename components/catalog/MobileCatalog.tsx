// components/catalog/MobileCatalog.tsx
'use client'

import { useState } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { SortDropdown } from '@/components/catalog/SortDropdown';
import Pagination from '@/components/catalog/Pagination';
import { X, ChevronDown, ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react';
import DualRangeSlider from '@/components/ui/DualRangeSlider'; // <-- новый импорт
import type { Product } from '@/types';
import type { FilterState } from '@/components/catalog/FilterPanel';
import type { StaticFilterOptions, CategoryFilterGroup } from '@/hooks/useCatalogFilters';

// Тип для мобильной секции фильтров (без изменений)
interface MobileSection {
  key: string;
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  categorySlug?: string;
  paginated?: boolean;
}

interface MobileCatalogProps {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  filters: FilterState;
  activeFiltersCount: number;
  showOnlySale: boolean;
  onToggleSale: () => void;
  onPageChange: (page: number) => void;
  onPageChangeWithScroll: (page: number) => void;
  onSortChange: (sort: string) => void;
  onApplyFilters: () => void;
  onClearAll: () => void;
  mobileSections: MobileSection[];
  onSectionToggle: (sectionKey: string, value: string) => void;
  minVal: number;
  maxVal: number;
  globalMinPrice: number;
  globalMaxPrice: number;
  onMinChange: (val: number) => void;
  onMaxChange: (val: number) => void;
  onPriceInputMin: (val: number) => void;
  onPriceInputMax: (val: number) => void;
}

// Маленький компонент для одной секции фильтров в модальном окне (без изменений)
function MobileFilterSection({
  title, options, selected, onToggle, paginated
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  paginated?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(options.length / perPage);
  const visibleOptions = paginated
    ? options.slice((page - 1) * perPage, page * perPage)
    : options;

  return (
    <div className="border-b border-borderLight pb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full text-left py-2 text-white font-medium"
      >
        <span>{title}</span>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {visibleOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-gray-300 cursor-pointer">
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-xs text-gray-400">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MobileCatalog({
  products, total, totalPages, page, loading,
  filters, activeFiltersCount,
  showOnlySale, onToggleSale,
  onPageChange, onPageChangeWithScroll, onSortChange,
  onApplyFilters, onClearAll,
  mobileSections, onSectionToggle,
  minVal, maxVal, globalMinPrice, globalMaxPrice,
  onMinChange, onMaxChange, onPriceInputMin, onPriceInputMax,
}: MobileCatalogProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Верхняя плашка (без изменений) */}
      <div className="fixed top-14 left-0 w-full bg-darkbg z-40 pt-3 pb-2 px-4">
        <div className="grid grid-cols-3 items-center">
          <div className="justify-self-start relative">
            <button onClick={() => setIsFilterOpen(true)} className="text-white font-medium border-[1.5px] border-white rounded-full px-5 py-1.5 text-sm">
              Фильтры
            </button>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="justify-self-center flex items-center gap-2">
            <button
              onClick={onToggleSale}
              className={`text-sm font-medium border-2 rounded-full px-3 py-1.5 transition-colors duration-150 focus:outline-none ${
                showOnlySale ? 'bg-white text-darkbg border-white' : 'bg-transparent text-white border-white'
              }`}
            >
              Акция
            </button>
            <button onClick={() => setIsSortOpen(true)} className="text-white border-[1.5px] border-white rounded-full p-1.5 focus:outline-none">
              <ChevronUp size={16} />
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="justify-self-end text-white font-semibold text-sm">
            Товаров: {total}
          </div>
        </div>
      </div>

      {/* Сетка товаров (без изменений) */}
      <div className="pt-24">
        {loading ? (
          <div className="text-center py-20 text-white">Загрузка...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Товары не найдены</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
            {products.map(product => <ProductCard key={product.article} product={product} />)}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-8 pb-20 flex justify-center">
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={onPageChange}
              onPageChangeWithScroll={onPageChangeWithScroll}
            />
          </div>
        )}
      </div>

      {/* Модальное окно фильтров (без изменений) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 overflow-auto" onClick={() => setIsFilterOpen(false)}>
          <div className="bg-darkbg min-h-screen p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Фильтры</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              {mobileSections.map(section => (
                <MobileFilterSection
                  key={section.key}
                  title={section.title}
                  options={section.options}
                  selected={section.selected}
                  onToggle={value => onSectionToggle(section.key, value)}
                  paginated={section.paginated}
                />
              ))}
              <div className="pt-2">
                <button
                  onClick={onToggleSale}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                    showOnlySale ? 'border border-white text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Акционная подборка
                </button>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={onClearAll} className="text-gray-400 hover:text-white underline">Сбросить фильтры</button>
              <button onClick={onApplyFilters} className="flex-1 bg-white text-darkbg py-3 rounded-lg font-semibold">Применить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно сортировки и цены – изменён блок ползунков */}
      {isSortOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 overflow-auto" onClick={() => setIsSortOpen(false)}>
          <div className="bg-darkbg min-h-screen p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Сортировка и цена</h2>
              <button onClick={() => setIsSortOpen(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-normal text-sm mb-2">Упорядочить:</h3>
                <SortDropdown onSort={onSortChange} />
              </div>
              <div className="mt-6">
                <h3 className="text-white font-normal text-sm mb-2">Цена: {minVal} – {maxVal} ₽</h3>
                {/* Двойной ползунок вместо двух отдельных */}
                <DualRangeSlider
                  min={globalMinPrice}
                  max={globalMaxPrice}
                  minValue={minVal}
                  maxValue={maxVal}
                  onMinChange={onMinChange}
                  onMaxChange={onMaxChange}
                />
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" min={globalMinPrice} max={globalMaxPrice} value={minVal} onChange={e => onPriceInputMin(Number(e.target.value))} placeholder="От, ₽" className="w-full px-2 py-1 text-sm bg-[#0f2a42] border border-borderLight rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span className="text-gray-400">–</span>
                  <input type="number" min={globalMinPrice} max={globalMaxPrice} value={maxVal} onChange={e => onPriceInputMax(Number(e.target.value))} placeholder="До, ₽" className="w-full px-2 py-1 text-sm bg-[#0f2a42] border border-borderLight rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
            </div>
            <button onClick={() => setIsSortOpen(false)} className="mt-6 w-full bg-white text-darkbg py-3 rounded-lg font-semibold">Применить</button>
          </div>
        </div>
      )}
    </div>
  );
}