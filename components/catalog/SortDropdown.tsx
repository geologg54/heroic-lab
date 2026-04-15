// components/catalog/SortDropdown.tsx
'use client'
export const SortDropdown = ({ onSort, products }: any) => (
  <select onChange={(e) => onSort(e.target.value)} className="bg-cardbg border border-borderLight rounded-lg px-4 py-2 text-white text-sm">
    <option value="default">Сортировка</option>
    <option value="price-asc">Сначала дешёвые</option>
    <option value="price-desc">Сначала дорогие</option>
    <option value="name">По названию</option>
    <option value="popularity">По популярности</option>
    <option value="date">Сначала новинки</option>
  </select>
)