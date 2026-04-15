// components/catalog/FilterPanel.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'
import { SlidersHorizontal, X, ChevronDown, ChevronRight } from 'lucide-react'

interface FilterState {
  categories: string[]
  subcategories: string[]
  gameSystems: string[]
  factions: string[]
  types: string[]
  scales: string[]
  fileFormats: string[]
  tags: string[]
}

interface FilterPanelProps {
  products: Product[]
  onFilter: (filtered: Product[], activeFilters: FilterState) => void
}

export const FilterPanel = ({ products, onFilter }: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    gameSystems: [],
    factions: [],
    types: [],
    scales: [],
    fileFormats: [],
    tags: [],
  })
  const [priceMax, setPriceMax] = useState(2000)
  // Состояние для аккордеона: какие секции развернуты
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: false,
    subcategories: false,
    gameSystems: false,
    factions: false,
    types: false,
    scales: false,
    fileFormats: false,
    tags: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const allCategories = [...new Set(products.map(p => p.category))]
  const allSubcategories = [...new Set(products.filter(p => p.subcategory).map(p => p.subcategory as string))]
  const allGameSystems = [...new Set(products.map(p => p.gameSystem))]
  const allFactions = [...new Set(products.filter(p => p.faction).map(p => p.faction as string))]
  const allTypes = [...new Set(products.map(p => p.type))]
  const allScales = [...new Set(products.map(p => p.scale))]
  const allFileFormats = [...new Set(products.flatMap(p => p.fileFormat.split(',').map(f => f.trim())))]
  const allTags = [...new Set(products.flatMap(p => p.tags))]

  const applyFilters = useCallback(() => {
    let filtered = products
    if (filters.categories.length) filtered = filtered.filter(p => filters.categories.includes(p.category))
    if (filters.subcategories.length) filtered = filtered.filter(p => p.subcategory && filters.subcategories.includes(p.subcategory))
    if (filters.gameSystems.length) filtered = filtered.filter(p => filters.gameSystems.includes(p.gameSystem))
    if (filters.factions.length) filtered = filtered.filter(p => p.faction && filters.factions.includes(p.faction))
    if (filters.types.length) filtered = filtered.filter(p => filters.types.includes(p.type))
    if (filters.scales.length) filtered = filtered.filter(p => filters.scales.includes(p.scale))
    if (filters.fileFormats.length) filtered = filtered.filter(p => filters.fileFormats.some(f => p.fileFormat.includes(f)))
    if (filters.tags.length) filtered = filtered.filter(p => p.tags.some(t => filters.tags.includes(t)))
    filtered = filtered.filter(p => p.price <= priceMax)
    onFilter(filtered, filters)
  }, [products, filters, priceMax, onFilter])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }))
  }

  const resetFilters = () => {
    setFilters({
      categories: [],
      subcategories: [],
      gameSystems: [],
      factions: [],
      types: [],
      scales: [],
      fileFormats: [],
      tags: [],
    })
    setPriceMax(2000)
  }

  const FilterSection = ({ title, sectionKey, options, selected }: { title: string; sectionKey: string; options: string[]; selected: string[] }) => {
    const isExpanded = expandedSections[sectionKey]
    return (
      <div className="border-b border-borderLight pb-3">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex justify-between items-center w-full text-left py-2 text-white font-semibold hover:text-accent transition"
        >
          <span>{title}</span>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-2 text-gray-300 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleFilter(sectionKey as keyof FilterState, opt)}
                /> {opt}
              </label>
            ))}
          </div>
        )}
      </div>
    )
  }

  const FilterContent = () => (
    <div className="space-y-4">
      <FilterSection title="Категория" sectionKey="categories" options={allCategories} selected={filters.categories} />
      <FilterSection title="Подкатегория" sectionKey="subcategories" options={allSubcategories} selected={filters.subcategories} />
      <FilterSection title="Система" sectionKey="gameSystems" options={allGameSystems} selected={filters.gameSystems} />
      <FilterSection title="Фракция" sectionKey="factions" options={allFactions} selected={filters.factions} />
      <FilterSection title="Тип модели" sectionKey="types" options={allTypes} selected={filters.types} />
      <FilterSection title="Масштаб" sectionKey="scales" options={allScales} selected={filters.scales} />
      <FilterSection title="Формат" sectionKey="fileFormats" options={allFileFormats} selected={filters.fileFormats} />
      <FilterSection title="Теги" sectionKey="tags" options={allTags.slice(0, 30)} selected={filters.tags} />
      <div className="pt-2">
        <div className="flex justify-between items-center">
          <span className="text-white font-semibold">Цена: до {priceMax} ₽</span>
        </div>
        <input type="range" min={0} max={2000} step={50} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="w-full mt-2" />
      </div>
      <button onClick={resetFilters} className="text-accent text-sm mt-2">Сбросить все фильтры</button>
    </div>
  )

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="lg:hidden flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg mb-4">
        <SlidersHorizontal size={18} /> Фильтры
      </button>
      <div className="hidden lg:block"><FilterContent /></div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 p-4 overflow-auto">
          <div className="bg-cardbg p-6 rounded-xl max-w-md mx-auto relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400"><X size={24} /></button>
            <h2 className="text-xl font-bold text-white mb-4">Фильтры</h2>
            <FilterContent />
            <button onClick={() => setIsOpen(false)} className="mt-6 w-full bg-accent py-2 rounded-lg">Применить</button>
          </div>
        </div>
      )}
    </>
  )
}