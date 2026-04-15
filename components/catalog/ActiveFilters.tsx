// components/catalog/ActiveFilters.tsx
'use client'
import { X } from 'lucide-react'

interface ActiveFiltersProps {
  filters: Record<string, string[]>
  onRemove: (key: string, value: string) => void
  onClearAll: () => void
}

const filterLabels: Record<string, string> = {
  categories: 'Категория',
  gameSystems: 'Система',
  factions: 'Фракция',
  types: 'Тип',
  scales: 'Масштаб',
  fileFormats: 'Формат',
  tags: 'Тег',
}

export const ActiveFilters = ({ filters, onRemove, onClearAll }: ActiveFiltersProps) => {
  const hasFilters = Object.values(filters).some(arr => arr.length > 0)
  if (!hasFilters) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(filters).map(([key, values]) => 
        values.map(value => (
          <span key={`${key}-${value}`} className="bg-accent/20 text-accent text-sm px-2 py-1 rounded-full flex items-center gap-1">
            {filterLabels[key] || key}: {value}
            <button onClick={() => onRemove(key, value)}><X size={14} /></button>
          </span>
        ))
      )}
      <button onClick={onClearAll} className="text-gray-400 text-sm hover:text-white">Сбросить все</button>
    </div>
  )
}