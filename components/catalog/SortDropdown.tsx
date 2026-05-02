// components/catalog/SortDropdown.tsx
'use client'

export const SortDropdown = ({ onSort }: any) => (
  <select
    onChange={(e) => onSort(e.target.value)}
    defaultValue="newest"
    className="w-full bg-darkbg text-white text-sm py-1 border-0 border-b border-white/30 focus:outline-none focus:border-white transition-colors cursor-pointer"
  >
    <option value="newest" className="bg-darkbg">По новизне (сначала новые)</option>
    <option value="oldest" className="bg-darkbg">По новизне (сначала старые)</option>
    <option value="price-asc" className="bg-darkbg">По цене (сначала дешевле)</option>
    <option value="price-desc" className="bg-darkbg">По цене (сначала дороже)</option>
    <option value="name" className="bg-darkbg">По названию (А-Я)</option>
    <option value="popularity" className="bg-darkbg">По популярности</option>
  </select>
)