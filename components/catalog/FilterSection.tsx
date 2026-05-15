// components/catalog/FilterSection.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'

interface FilterSectionProps {
  sectionKey: string // Уникальный ключ секции (например, 'categories', 'filter1', 'scales')
  title: string // Заголовок секции (например, 'Категория', 'Масштаб')
  options: string[] // Все доступные значения фильтра (например, для категорий это массив slug'ов)
  selected: string[] // Массив выбранных значений
  onToggle: (value: string) => void // Функция переключения значения
  categorySlug?: string // Если секция привязана к конкретной категории (для мультикатегорий)
  paginated?: boolean // Нужно ли разбивать опции на страницы (для длинных списков)
  /** Статические счётчики товаров для каждой опции.
   *  Например, { "Монстр": 12, "Герой": 5 }.
   *  Если не передан, числа не показываются.
   */
  counts?: Record<string, number>
  /** Карта преобразования slug → human name (нужна для секции категорий) */
  categoryNames?: Record<string, string>
}

// Умная сортировка: сначала числа, потом строки
function smartSort(a: string, b: string): number {
  const aNum = Number(a)
  const bNum = Number(b)
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export default function FilterSection({
  sectionKey,
  title,
  options,
  selected,
  onToggle,
  categorySlug,
  paginated = false,
  counts = {},
  categoryNames = {}, // по умолчанию пустой объект
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 10

  const sortedOptions = [...options].sort(smartSort)
  const totalPages = Math.ceil(sortedOptions.length / perPage)
  const visibleOptions = paginated
    ? sortedOptions.slice((page - 1) * perPage, page * perPage)
    : sortedOptions

  return (
    <div className="pb-3">
      {/* Заголовок секции; клик раскрывает/скрывает опции */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full text-left py-2 text-white font-normal hover:text-accent transition"
      >
        <span>{title}</span>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {/* Если это секция тегов и опций нет – показываем подсказку */}
          {options.length === 0 && sectionKey === 'tags' ? (
            <p className="text-gray-400 text-sm px-1">Для отображения тегов выберите категорию</p>
          ) : (
            <>
              {visibleOptions.map((opt) => {
                const count = counts[opt] // счётчик товаров для данной опции (если есть)
                // Отображаемое название: для категорий берём из categoryNames, иначе сам opt
                const displayName = sectionKey === 'categories' && categoryNames[opt]
                  ? categoryNames[opt]
                  : opt
                return (
                  <label key={opt} className="flex items-center gap-2 text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(opt)}
                      onChange={() => onToggle(opt)}
                      className="rounded border-gray-500"
                    />
                    <span>
                      {displayName}
                      {count !== undefined && (
                        <span className="ml-1 text-white/60 text-xs">({count})</span>
                      )}
                    </span>
                  </label>
                )
              })}

              {/* Пагинация, если опций много */}
              {paginated && totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-gray-400">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}