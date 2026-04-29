// components/catalog/ActiveFilters.tsx
'use client'
import { X } from 'lucide-react'
import { FilterState } from './FilterPanel'

interface ActiveFiltersProps {
  filters: FilterState
  onRemove: (key: keyof FilterState, value: string) => void
  onClearAll: () => void
  categoryNames?: Record<string, string>
}

const filterLabels: Record<string, string> = {
  categories: 'Категория',
  gameSystems: 'Система',
  factions: 'Фракция',
  types: 'Тип',
  scales: 'Масштаб',
  fileFormats: 'Формат',
  tags: 'Тег',
  filter1: 'Фильтр 1',
  filter2: 'Фильтр 2',
  filter3: 'Фильтр 3',
  filter4: 'Фильтр 4',
  filter5: 'Фильтр 5',
}

export const ActiveFilters = ({ filters, onRemove, onClearAll, categoryNames = {} }: ActiveFiltersProps) => {
  // Проверяем только массивы, чтобы не пытаться перебирать categoryFilters
  const hasFilters = Object.entries(filters).some(
    ([, values]) => Array.isArray(values) && values.length > 0
  )
  if (!hasFilters) return null

  const getDisplayValue = (key: string, value: string) => {
    if (key === 'categories' && categoryNames[value]) {
      return categoryNames[value]
    }
    return value
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(filters).map(([key, values]) => {
        // Пропускаем не-массивы (объект categoryFilters) и пустые массивы
        if (!Array.isArray(values)) return null
        return values.map((value: string) => (
          <span
            key={`${key}-${value}`}
            className="bg-accent/20 text-accent text-sm px-2 py-1 rounded-full flex items-center gap-1"
          >
            {filterLabels[key] || key}: {getDisplayValue(key, value)}
            <button onClick={() => onRemove(key as keyof FilterState, value)}>
              <X size={14} />
            </button>
          </span>
        ))
      })}
      <button onClick={onClearAll} className="text-gray-400 text-sm hover:text-white">
        Сбросить все
      </button>
    </div>
  )
}