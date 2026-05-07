// components/admin/ReviewsFilters.tsx
'use client'

interface ReviewsFiltersProps {
  filterFeatured: string
  setFilterFeatured: (v: string) => void
  filterHasPhoto: string
  setFilterHasPhoto: (v: string) => void
  filterRating: string
  setFilterRating: (v: string) => void
  sortBy: string
  setSortBy: (v: string) => void
  sortOrder: string
  onToggleSortOrder: () => void
}

/**
 * Строка фильтров и сортировки для отзывов.
 */
export default function ReviewsFilters({
  filterFeatured, setFilterFeatured,
  filterHasPhoto, setFilterHasPhoto,
  filterRating, setFilterRating,
  sortBy, setSortBy,
  sortOrder, onToggleSortOrder,
}: ReviewsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        value={filterFeatured}
        onChange={(e) => setFilterFeatured(e.target.value)}
        className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white"
      >
        <option value="">Все</option>
        <option value="true">На главной</option>
        <option value="false">Не на главной</option>
      </select>
      <select
        value={filterHasPhoto}
        onChange={(e) => setFilterHasPhoto(e.target.value)}
        className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white"
      >
        <option value="">Фото: любые</option>
        <option value="true">С фото</option>
        <option value="false">Без фото</option>
      </select>
      <select
        value={filterRating}
        onChange={(e) => setFilterRating(e.target.value)}
        className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white"
      >
        <option value="">Любой рейтинг</option>
        {[5, 4, 3, 2, 1].map((i) => (
          <option key={i} value={i}>
            {i} зв.
          </option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white"
      >
        <option value="createdAt">Дата</option>
        <option value="rating">Рейтинг</option>
      </select>
      <button
        onClick={onToggleSortOrder}
        className="bg-[#0f2a42] border border-borderLight rounded px-3 py-1 text-sm text-white"
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  )
}