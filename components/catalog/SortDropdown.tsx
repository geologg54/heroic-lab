// components/catalog/SortDropdown.tsx
'use client'

export const SortDropdown = ({ onSort }: any) => (
  <select
    onChange={(e) => onSort(e.target.value)}
    defaultValue="newest"
    className="w-full bg-darkbg text-white text-sm py-1 border-0 border-b border-white/30 focus:outline-none focus:border-white transition-colors cursor-pointer"
  >
    <option value="newest" className="bg-darkbg">сначала новинки</option>
    <option value="price-asc" className="bg-darkbg">сначала дешёвые</option>
    <option value="price-desc" className="bg-darkbg">сначала дорогие</option>
    <option value="name" className="bg-darkbg">по названию</option>
    <option value="popularity" className="bg-darkbg">по популярности</option>
  </select>
)